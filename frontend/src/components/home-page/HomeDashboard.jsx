import {
  FaInfo,
  FaQuestion,
} from "react-icons/fa";
import "./HomeDashboard.css";

export default function HomeDashboard({
  imageSrc,
  onInfoClick,
  onTutorialClick,
  tutorialDisabled = true,
}) {
  return (
    <header className="home-dashboard">
      <div className="home-dashboard-brand">
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Aalen University"
            className="home-dashboard-logo"
          />
        )}
      </div>
      <div className="home-dashboard-actions">
        <button
          type="button"
          className="home-dashboard-icon-button"
          aria-label="Open tutorial"
          title="Tutorial"
          disabled={tutorialDisabled}
          onClick={onTutorialClick}
        >
          <FaQuestion aria-hidden="true" />
        </button>

        <button
          type="button"
          className="home-dashboard-icon-button"
          aria-label="Open app information"
          title="Info"
          onClick={onInfoClick}
        >
          <FaInfo aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}