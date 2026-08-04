import { useTranslation } from "react-i18next";
import "./EditHuntDetails.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function EditHuntDetails({
  open,
  onToggle,
  huntName,
  onHuntNameChange,
  creatorName,
  onCreatorNameChange,
  huntLocation,
  onHuntLocationChange,
  startPoint,
  onStartPointChange,
  privateHunt,
  onPrivateHuntChange,
  isActive,
  onIsActiveChange,
}) {
  const { t } = useTranslation();

  return (
    <section
      className={`accordion-section edit-hunt-details ${
        open ? "open" : ""
      }`}
    >
      <button
        type="button"
        className="accordion-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>{t("details")}</span>
        <span className="edit-hunt-accordion-icon" aria-hidden="true">
          {open ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>
      {open && (
        <div className="accordion-content edit-hunt-details-content">
          <label className="edit-hunt-details-field">
            <span>{t("hunt_name")}</span>
            <input
              className="EditHunt-input"
              type="text"
              value={huntName}
              onChange={(event) => onHuntNameChange(event.target.value)}
              required
              placeholder={t("hunt_name")}
              style={{
                borderColor: !huntName.trim() ? "red" : undefined,
              }}
            />
          </label>
          <label className="edit-hunt-details-field">
            <span>
              {t("quick_information")}{" "}
              <span className="edit-hunt-required" aria-hidden="true">
                *
              </span>
            </span>
            <input
              className="EditHunt-input"
              type="text"
              value={creatorName}
              onChange={(event) =>
                onCreatorNameChange(event.target.value)
              }
              required
              placeholder={t("quick_information")}
              style={{
                borderColor: !creatorName.trim()
                  ? "red"
                  : undefined,
              }}
            />
          </label>
          <hr className="edit-hunt-details-divider" />
          <label className="edit-hunt-details-field">
            <span>
              {t("location_of_the_game")}{" "}
              <span className="edit-hunt-required" aria-hidden="true">
                *
              </span>
            </span>
            <input
              className="EditHunt-input"
              type="text"
              value={huntLocation}
              onChange={(event) =>
                onHuntLocationChange(event.target.value)
              }
              required
              placeholder={t("location_of_the_game")}
              style={{
                borderColor: !huntLocation.trim()
                  ? "red"
                  : undefined,
              }}
            />
          </label>
          <label className="edit-hunt-details-field">
            <span>
              {t("starting_point")}{" "}
              <span className="edit-hunt-required" aria-hidden="true">
                *
              </span>
            </span>
            <input
              className="EditHunt-input"
              type="text"
              value={startPoint}
              onChange={(event) =>
                onStartPointChange(event.target.value)
              }
              required
              placeholder={t("starting_point")}
              style={{
                borderColor: !startPoint.trim()
                  ? "red"
                  : undefined,
              }}
            />
          </label>
          <hr className="edit-hunt-details-divider" />
          <div className="edit-hunt-checkbox-list">
            <label className="edit-hunt-checkbox-row">
              <span>{t("private")}</span>
              <input
                className="EditHunt-checkbox"
                type="checkbox"
                checked={privateHunt}
                onChange={(event) =>
                  onPrivateHuntChange(event.target.checked)
                }
              />
            </label>
            <label className="edit-hunt-checkbox-row">
              <span>{t("active")}</span>
              <input
                className="EditHunt-checkbox"
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  onIsActiveChange(event.target.checked)
                }
              />
            </label>
          </div>
        </div>
      )}
    </section>
  );
}