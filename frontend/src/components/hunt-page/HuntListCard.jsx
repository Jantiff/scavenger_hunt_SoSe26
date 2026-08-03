import { useTranslation } from "react-i18next";
import "./HuntListCard.css";

export default function HuntListCard({ hunt, onClick }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="hunt-list-card"
      onClick={onClick}
    >
      <div className="hunt-list-card-header">
        <h3 className="hunt-list-card-title">
          {hunt.name}
        </h3>

        {hunt.created_at && (
          <span className="hunt-list-card-date">
            {new Date(hunt.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="hunt-list-card-details">
        <div className="hunt-list-card-detail">
          <span className="hunt-list-card-label">
            {t("location")}
          </span>

          <span className="hunt-list-card-value">
            {hunt.place_to_play}
          </span>
        </div>

        <div className="hunt-list-card-detail">
          <span className="hunt-list-card-label">
            {t("start_point")}
          </span>

          <span className="hunt-list-card-value">
            {hunt.start_point}
          </span>
        </div>
      </div>
    </button>
  );
}