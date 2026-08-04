import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import usePopup from "../../components/usePopup";
import Popup from "../../components/Popup";
import "./EditHunt.css";
import { AuthContext } from "../../AuthContext";
import AppButton from "../../components/buttons/AppButton";
import EditHuntDetails from "../../components/edithunt-page/EditHuntDetails";
import EditHuntQuestions from "../../components/edithunt-page/EditHuntQuestions";
import { FaSave, FaTrash } from "react-icons/fa";

export default function EditHunt() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
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

    if (!huntNameState.trim()) {
      errors.push("Name des Spiels ist erforderlich");
    }

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
            name: huntNameState.trim(),
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
      <h1 className="edit-hunt-title">
        {t("hunt_id")}: {huntCode}
      </h1>

      <EditHuntDetails
        open={showDetails}
        onToggle={() => setShowDetails((previous) => !previous)}
        huntName={huntNameState}
        onHuntNameChange={setHuntNameState}
        creatorName={creatorName}
        onCreatorNameChange={setCreatorName}
        huntLocation={huntLocation}
        onHuntLocationChange={setHuntLocation}
        startPoint={startPoint}
        onStartPointChange={setStartPoint}
        privateHunt={privateHunt}
        onPrivateHuntChange={setPrivateHunt}
        isActive={is_active}
        onIsActiveChange={setIsActive}
      />
      <EditHuntQuestions
          open={showQuestions}
          onToggle={() => setShowQuestions((previous) => !previous)}
          questions={questions}
          onDragEnd={handleDragEnd}
          onToggleQuestion={handleToggleQuestion}
          onEditQuestion={handleEditQuestion}
          onRemoveQuestion={handleRemoveQuestion}
          onAddQuestion={handleAddQuestion}
        />
      {/* Save and Exit Button */}
      <div className="save-exit-container">
        <div className="edit-hunt-action">
          <AppButton
            icon={<FaSave aria-hidden="true" />}
            fullWidth
            variant="green"
            onClick={handleSaveAndExit}
          >
            {t("save_and_exit")}
          </AppButton>
        </div>
        <div className="edit-hunt-action">
          <AppButton
            icon={<FaTrash aria-hidden="true" />}
            fullWidth
            variant="red"
            onClick={handleDeleteHunt}
          >
            {t("delete_Hunt")}
          </AppButton>
        </div>
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
