import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FaInfo, FaQuestion } from "react-icons/fa";
import InfoModal from "./InfoModal";
import "./AppDashboard.css";

export default function AppDashboard({
  imageSrc,
  infoText,
  onTutorialClick,
  tutorialDisabled = true,
}) {
  const location = useLocation();
  const [showInfo, setShowInfo] = useState(false);

  const hiddenRoutes = ["/login", "/register"];

  const shouldHideDashboard =
    hiddenRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/playhunt/");

  if (shouldHideDashboard) {
    return null;
  }
  return (
    <>
      <header className="app-dashboard">
        <div className="app-dashboard-brand">
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Aalen University"
              className="app-dashboard-logo"
            />
          )}
        </div>
        <div className="app-dashboard-actions">
          <button
            type="button"
            className="app-dashboard-icon-button"
            aria-label="Open tutorial"
            title="Tutorial"
            disabled={tutorialDisabled}
            onClick={onTutorialClick}
          >
            <FaQuestion aria-hidden="true" />
          </button>

          <button
            type="button"
            className="app-dashboard-icon-button"
            aria-label="Open app information"
            title="Info"
            onClick={() => setShowInfo(true)}
          >
            <FaInfo aria-hidden="true" />
          </button>
        </div>
      </header>
      <InfoModal
        open={showInfo}
        text={infoText}
        onClose={() => setShowInfo(false)}
      />
    </>
  );
}