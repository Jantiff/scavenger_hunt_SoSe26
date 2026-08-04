import { useTranslation } from "react-i18next";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import AppButton from "../buttons/AppButton";
import "./EditHuntQuestions.css";
import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

export default function EditHuntQuestions({
  open,
  onToggle,
  questions,
  onDragEnd,
  onToggleQuestion,
  onEditQuestion,
  onRemoveQuestion,
  onAddQuestion,
}) {
  const { t } = useTranslation();

  return (
    <section 
      className={`accordion-section edit-hunt-questions ${
        open ? "open" : ""
      }`}
    >
      <button
        type="button"
        className="accordion-toggle edit-hunt-questions-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>{t("questions")}</span>
        <span className="edit-hunt-accordion-icon" aria-hidden="true">
          {open ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>
      {open && (
        <div className="accordion-content">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  className="edit-hunt-question-list"
                  {...provided.droppableProps}
                >
                  {questions.map((question, index) => (
                    <Draggable
                      key={question.id}
                      draggableId={String(question.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          className={`edit-hunt-question-card ${
                            snapshot.isDragging ? "dragging" : ""
                          }`}
                          {...provided.draggableProps}
                        >
                          <div className="edit-hunt-question-header">
                            <div
                              className="edit-hunt-question-drag"
                              aria-label={`${t("question")} ${index + 1} verschieben`}
                              {...provided.dragHandleProps}
                            >
                              <span aria-hidden="true">⋮⋮</span>
                            </div>
                            <button
                              type="button"
                              className="edit-hunt-question-toggle"
                              aria-expanded={question.open}
                              onClick={() => onToggleQuestion(index)}
                            >
                              <span>
                                {t("question")} {index + 1}
                              </span>
                              <span
                                className="edit-hunt-question-chevron"
                                aria-hidden="true"
                              >
                                {question.open ? (
                                  <FaChevronUp />
                                ) : (
                                  <FaChevronDown />
                                )}
                              </span>
                            </button>
                          </div>
                          {question.open && (
                            <div className="edit-hunt-question-content">
                              <div className="edit-hunt-question-information">
                                <div className="edit-hunt-question-information-row">
                                  <span className="edit-hunt-question-label">
                                    {t("question")}
                                  </span>
                                  <span className="edit-hunt-question-value">
                                    {question.text || "—"}
                                  </span>
                                </div>
                                <div className="edit-hunt-question-information-row">
                                  <span className="edit-hunt-question-label">
                                    {t("answer_type")}
                                  </span>
                                  <span className="edit-hunt-question-value">
                                    {question.answerType || "—"}
                                  </span>
                                </div>
                              </div>
                              <div className="edit-hunt-question-actions">
                                <AppButton
                                  icon={<FaEdit aria-hidden="true" />}
                                  fullWidth
                                  variant="orange"
                                  onClick={() => onEditQuestion(index)}
                                >
                                  {t("edit")}
                                </AppButton>

                                <AppButton
                                  icon={<FaTrash aria-hidden="true" />}
                                  fullWidth
                                  variant="red"
                                  onClick={() => onRemoveQuestion(question.id)}
                                >
                                  <span className="edit-hunt-question-label">
                                    {t("remove")}
                                  </span>
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
          <div className="edit-hunt-add-question-action">
            <AppButton
              icon={<FaPlus aria-hidden="true" />}
              variant="blue"
              onClick={onAddQuestion}
            >
              {t("add_question")}
            </AppButton>
          </div>
        </div>
      )}
    </section>
  );
}