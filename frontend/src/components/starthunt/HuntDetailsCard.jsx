import { useTranslation } from "react-i18next";
import "./HuntDetailsCard.css";

export default function HuntDetailsCard({ hunt }) {
  const { t } = useTranslation();

  return (
    <div className="hunt-details-card">
      <header className="hunt-details-card-header">
        <h1 className="hunt-details-card-title">
          {hunt.name}
        </h1>
      </header>
      <div className="hunt-details-card-row">
        <div className="hunt-details-card-item">
          <span className="hunt-details-card-label">
            {t("creator")}
          </span>
          <span className="hunt-details-card-value">
            {hunt.creator_username}
          </span>
        </div>
        <div className="hunt-details-card-item">
          <span className="hunt-details-card-label">
            {t("hunt_code")}
          </span>
          <span className="hunt-details-card-value">
            {hunt.code}
          </span>
        </div>
      </div>
      <div className="hunt-details-card-row">
        <div className="hunt-details-card-item">
          <span className="hunt-details-card-label">
            {t("location")}
          </span>
          <span className="hunt-details-card-value">
            {hunt.place_to_play}
          </span>
        </div>
        <div className="hunt-details-card-item">
          <span className="hunt-details-card-label">
            {t("start_point")}
          </span>
          <span className="hunt-details-card-value">
            {hunt.start_point}
          </span>
        </div>
      </div>
      <div className="hunt-details-card-row hunt-details-card-row--wide">
          <div className="hunt-details-card-item hunt-details-card-item--wide">
            <span className="hunt-details-card-label">
              {t("hunt_info")}
            </span>
            <span className="hunt-details-card-value hunt-details-card-description">
              {hunt.description}
            </span>
          </div>
      </div>
      <div className="hunt-details-card-row">
        <div className="hunt-details-card-item">
          <span className="hunt-details-card-label">
            {t("hunt_status")}
          </span>
          <span className="hunt-details-card-value">
            {hunt.is_active ? t("active") : t("inactive")}
          </span>
        </div>
        <div className="hunt-details-card-item">
          <span className="hunt-details-card-label">
            {t("private_hunt")}
          </span>
          <span className="hunt-details-card-value">
            {hunt.private ? t("yes") : t("no")}
          </span>
        </div>
      </div>
    </div>
  );
}