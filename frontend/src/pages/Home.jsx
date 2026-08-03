import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { AuthContext } from "../AuthContext";
import AppButton from "../components/buttons/AppButton";
import config from "../../config.js";
import { 
  FaPlus,
  FaCompressArrowsAlt,
} from "react-icons/fa";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authFetch } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const [huntName, setHuntName] = useState("");
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const handleCreate = async () => {
    setError("");
    if (!huntName.trim()) {
      setError(t("please_enter_name"));
      return;
    }

    try {
      const res = await authFetch("/create-hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: huntName.trim() }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Create hunt failed");
      }

      const data = await res.json();
      const newHuntId = data.hunt.id;

      setShowPopup(false);
      setHuntName("");
      navigate(`/EditHunt/${newHuntId}`);
    } catch (err) {
      console.error(err);
      if (err.message.includes("Unauthorized")) {
        setError(t("please_login"));
        <button
          className="main-button main-button-green"
          onClick={() => navigate("/login")}
        >
          {t("login")}
        </button>;
        return;
      }
      setError(t(err.message || "An error occurred while creating the hunt"));
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        {config.linkOfImage && (
          <img
            src={config.linkOfImage}
            alt="Aalen University"
            className="home-logo"
          />
        )}
        <div className="home-header-actions">
          <button
            type="button"
            className="home-header-button info-button"
            onClick={() => setShowInfo(!showInfo)}
            aria-label="Open app information"
          >
            i
          </button>
          <button
            type="button"
            className="home-header-button tutorial-button"
            aria-label="Open tutorial"
            disabled
          >
            ?
          </button>
        </div>
      </header>
      <h1 className="heading">
        {t("scavenger_hunt")}
      </h1>
            
        {showInfo && (
          <div className="info-text">
            {config.infoText}
          </div>
        )}
      
      <div className="home-action-list">
        <AppButton
          icon={<FaCompressArrowsAlt />}
          fullWidth
          onClick={() => navigate("/join")}
        >
          {t("join")}
        </AppButton>
        <AppButton
          icon={<FaPlus />}
          fullWidth
          onClick={() => setShowPopup(true)}
        >
          {t("create")}
        </AppButton>
      </div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>{t("enter_hunt_name")}</h2>
            <input
              type="text"
              value={huntName}
              onChange={(e) => setHuntName(e.target.value)}
              placeholder={t("hunt_name")}
              autoFocus
            />
            {error && <p className="error">{error}</p>}
            <div className="popup-buttons">
              <AppButton
                variant="green"
                fullWidth
                onClick={handleCreate}
              >
                {t("create")}
              </AppButton>
              <AppButton
                variant="neutral"
                fullWidth
                onClick={() => {
                  setShowPopup(false);
                  setError("");
                  setHuntName("");
                }}
              >
                {t("cancel")}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
