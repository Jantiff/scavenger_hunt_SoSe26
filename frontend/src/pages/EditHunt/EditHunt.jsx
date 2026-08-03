import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import usePopup from "../../components/usePopup";
import Popup from "../../components/Popup";
import "./EditHunt.css";
import { AuthContext } from "../../AuthContext";
import AppButton from "../../components/buttons/AppButton";

export default function EditHunt() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(true);
  const [showQuestions, setShowQuestions] = useState(true);
  const [creatorName, setCreatorName] = useState("");
  const [huntLocation, setHuntLocation] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [huntNameState, setHuntNameState] = useState("");
  const { popup, showAlert, showConfirm, handleClose, handleConfirm } =
    usePopup();

  const [huntCode, setHuntCode] = useState("");
  const [privateHunt, setPrivateHunt] = useState(true);
  const [is_active, setIsActive] = useState(true);

  const { huntId } = useParams();

  const { authFetch } = useContext(AuthContext);

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!huntId) return;

    async function loadHunt() {
      try {
        const [huntRes, cluesRes] = await Promise.all([
          authFetch(`/hunts/${huntId}`),
          authFetch(`/hunts/${huntId}/clues`),
        ]);

        if (!huntRes.ok || !cluesRes.ok) {
          throw new Error("Failed to fetch hunt or clues");
        }

        const hunt = await huntRes.json();
        const clues = await cluesRes.json();

        setCreatorName(hunt.description || "");
        setHuntLocation(hunt.place_to_play || "");
        setStartPoint(hunt.start_point || "");
        setHuntNameState(hunt.name || "");
        setHuntCode(hunt.code || "");
        setIsActive(hunt.is_active ?? true);
        setPrivateHunt(hunt.private ?? true);

        setQuestions(
          clues.map((clue) => ({
            id: clue.id,
            text: clue.description ?? "",
            answer: clue.correct_answer ?? "",
            order: clue.clue_order ?? 0,
            open: false,

            answerType: clue.answer_type ?? "",
          })),
        );
      } catch (err) {
        console.error("Failed to load hunt or clues", err);
      }
    }

    loadHunt();
  }, [huntId, authFetch]);

  async function syncOrder(updatedQuestions) {
    await Promise.all(
      updatedQuestions.map(({ id, order }) =>
        authFetch(`/hunts/${huntId}/clues/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clue_order: order }),
        }),
      ),
    );
  }

  // Neue Frage hinzufügen
  const handleAddQuestion = () => {
    async function addQuestion() {
      try {
        const nextOrder = questions.length + 1;
        const res = await authFetch(`/hunts/${huntId}/clues`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clue_order: nextOrder }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to create clue");
        }

        const payload = await res.json();
        console.log("New clue created:", payload);
        const newClueId = payload.id;
        setQuestions([
          ...questions,
          {
            text: "",
            answer: "",
            id: newClueId,
            order: nextOrder,
            open: false,
          },
        ]);
      } catch (err) {
        console.error("Failed to add question", err);
      }
    }

    addQuestion();
  };

  // Frage öffnen/schließen
  const handleToggleQuestion = (idx) => {
    setQuestions((questions) =>
      questions.map((q, i) => (i === idx ? { ...q, open: !q.open } : q)),
    );
  };

  // Frage entfernen
  const handleRemoveQuestion = async (clueId) => {
    if (!(await showConfirm("Delete this question?"))) return;
    try {
      const res = await authFetch(`/hunts/${huntId}/clues/${clueId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      const filtered = questions.filter((q) => q.id !== clueId);

      const reindexed = filtered.map((q, idx) => ({
        ...q,
        order: idx + 1,
      }));
      setQuestions(reindexed);

      await syncOrder(reindexed);
    } catch (err) {
      console.error("Failed to delete question", err);
      await showAlert("Could not remove question.");
    }
  };

  // Validierungsfunktion hinzufügen
  const validateRequiredFields = () => {
    const errors = [];

    if (!creatorName.trim()) {
      errors.push("Kurzinfo ist erforderlich");
    }
    if (!huntLocation.trim()) {
      errors.push("Ort des Spieles ist erforderlich");
    }
    if (!startPoint.trim()) {
      errors.push("Startpunkt ist erforderlich");
    }

    if (errors.length > 0) {
      showAlert(
        "Bitte füllen Sie alle Pflichtfelder aus:\n" + errors.join("\n"),
      );

      return false;
    }
    return true;
  };

  const handleEditQuestion = (idx) => {
    // Validierung vor dem Navigieren
    if (!validateRequiredFields()) {
      return;
    }
    async function save() {
      try {
        const res = await authFetch(`/hunts/${huntId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: creatorName,
            place_to_play: huntLocation,
            start_point: startPoint,
            is_active: true,
          }),
        });
        if (!res.ok) throw new Error("Failed to save hunt");

        await Promise.all(
          questions.map((q) =>
            authFetch(`/hunts/${huntId}/clues/${q.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clue_order: q.order }),
            }),
          ),
        );
      } catch (err) {
        console.error("Failed to save hunt", err);
      }
    }

    save();

    const question = questions[idx];
    if (!question) return;

    // Navigate to EditQuestion page with huntId and clueId
    navigate(`/EditQuestion?hunt=${huntId}&clue=${question.id}`);
  };

  // Funktion zum Tauschen der Reihenfolge
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newQuestions = Array.from(questions);
    const [moved] = newQuestions.splice(result.source.index, 1);
    newQuestions.splice(result.destination.index, 0, moved);
    const reordered = newQuestions.map((q, idx) => ({
      ...q,
      order: idx + 1,
    }));

    setQuestions(reordered);

    syncOrder(reordered).catch((err) => {
      console.error("Failed to sync order", err);
    });
  };

  const handleSaveAndExit = () => {
    // Validierung vor dem Speichern
    if (!validateRequiredFields()) {
      return;
    }

    async function saveAndExit() {
      try {
        const res = await authFetch(`/hunts/${huntId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: creatorName,
            place_to_play: huntLocation,
            start_point: startPoint,
            is_active: is_active,
            private: privateHunt,
          }),
        });
        if (!res.ok) throw new Error("Failed to save hunt");

        await Promise.all(
          questions.map((q) =>
            authFetch(`/hunts/${huntId}/clues/${q.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clue_order: q.order }),
            }),
          ),
        );
        await showAlert(t("hunt_saved_successfully"));
        navigate(-1);
      } catch (err) {
        console.error("Failed to save hunt", err);
        await showAlert(t("could_not_save_order"));
      }
    }

    saveAndExit();
  };

  const handleDeleteHunt = async () => {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this hunt?",
    );
    if (!confirmed) return;
    try {
      const res = await authFetch(`/hunts/${huntId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete hunt");
      }
      await showAlert("Hunt deleted successfully.");
      navigate(-1);
    } catch (error) {
      console.error("Error deleting hunt:", error);
      await showAlert("Could not delete the hunt.");
    }
  };

  return (
    <div className="edit-hunt-container">
      <h1 className="heading">{huntNameState}</h1>

      {/* Angaben Reiter */}
      <div className={`accordion-section ${showDetails ? "open" : ""}`}>
        <button
          type="button"
          className="accordion-toggle"
          onClick={() => setShowDetails((prev) => !prev)}
        >
          {t("details")} {showDetails ? "▲" : "▼"}
        </button>
        {showDetails && (
          <div className="accordion-content">
            <label>{t("hunt_id")}: {huntCode}</label>
            {/*             <label>
              Hunt Name:
              <input
                className="EditHunt-input"
                type="text"
                value={huntNameState}
                onChange={(e) => setHuntNameState(e.target.value)}
                placeholder="Hunt Name eingeben"
              />
            </label> */}
            <label>
              {t("quick_information")}: <span style={{ color: "red" }}>*</span>
              <input
                className="EditHunt-input"
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                required
                placeholder={t("quick_information")}
                style={{
                  borderColor: !creatorName.trim() ? "red" : undefined,
                }}
              />
            </label>
            <label>
              {t("location_of_the_game")}: <span style={{ color: "red" }}>*</span>
              <input
                className="EditHunt-input"
                type="text"
                value={huntLocation}
                onChange={(e) => setHuntLocation(e.target.value)}
                required
                placeholder={t("location_of_the_game")}
                style={{
                  borderColor: !huntLocation.trim() ? "red" : undefined,
                }}
              />
            </label>
            <label>
              {t("starting_point")}: <span style={{ color: "red" }}>*</span>
              <input
                className="EditHunt-input"
                type="text"
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                required
                placeholder={t("starting_point")}
                style={{
                  borderColor: !startPoint.trim() ? "red" : undefined,
                }}
              />
            </label>
            <label>
              {t("private")}:
              <input
                className="EditHunt-checkbox"
                type="checkbox"
                checked={privateHunt}
                onChange={(e) => setPrivateHunt(e.target.checked)}
              />
            </label>
            <label>
              {t("active")}:
              <input
                className="EditHunt-checkbox"
                type="checkbox"
                checked={is_active}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </label>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className={`accordion-section ${showQuestions ? "open" : ""}`}>
        <button
          type="button"
          className="accordion-toggle"
          onClick={() => setShowQuestions((prev) => !prev)}
        >
          {t("questions")} {showQuestions ? "▲" : "▼"}
        </button>
        {showQuestions && (
          <div className="accordion-content">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {questions.map((question, idx) => (
                      <Draggable
                        key={idx}
                        draggableId={String(idx)}
                        index={idx}
                      >
                        {(provided, snapshot) => (
                          <div
                            className={`question-widget${snapshot.isDragging ? " dragging" : ""}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <button
                              type="button"
                              className={`question-toggle ${question.open ? "corners" : ""}`}
                              onClick={() => handleToggleQuestion(idx)}
                            >
                              {t("question")} {idx + 1} {question.open ? "▲" : "▼"}
                            </button>
                            {question.open && (
                              <div className="question-content">
                                <div className="drag-icon">⋮⋮</div>
                                <label>
                                  {t("question")}: {question.text}
                                  <br />
                                </label>
                                <label>
                                  {t("answer_type")}: {question.answerType}
                                  <br />
                                </label>
                                <div className="question-actions">
                                  <AppButton
                                    fullWidth
                                    variant="orange"
                                    onClick={() => handleEditQuestion(idx)}
                                  >
                                    {t("edit")}
                                  </AppButton>
                                  <AppButton
                                    fullWidth
                                    variant="red"
                                    onClick={() =>
                                      handleRemoveQuestion(questions[idx].id)
                                    }
                                  >
                                    {t("remove")}
                                  </AppButton>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <AppButton
              fullWidth
              variant="blue"
              onClick={handleAddQuestion}
            >
              {t("add_question")}
            </AppButton>
          </div>
        )}
      </div>

      {/* Save and Exit Button */}
      <div className="save-exit-container">
        <AppButton
          fullWidth
          variant="green"
          onClick={handleSaveAndExit}
        >
          {t("save_and_exit")}
        </AppButton>
        <AppButton
          fullWidth
          variant="red"
          onClick={handleDeleteHunt}
        >
          {t("delete_Hunt")}
        </AppButton>
      </div>
      <Popup
        open={popup.open}
        text={popup.text}
        confirmMode={popup.confirmMode}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
