import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { AuthContext } from "../AuthContext";
import AppButton from "../components/buttons/AppButton";
import HomeDashboard from "../components/home-page/HomeDashboard";
import InfoModal from "../components/home-page/InfoModal";
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
        <AppButton
          variant="green"
          onClick={() => navigate("/login")}
        >
          {t("login")}
        </AppButton>;
        return;
      }
      setError(t(err.message || "An error occurred while creating the hunt"));
    }
  };

  return (
    <div className="home-container">
      <HomeDashboard
        imageSrc={config.linkOfImage}
        onInfoClick={() => setShowInfo(true)}
        tutorialDisabled
      />
      <h1 className="heading">
        {t("scavenger_hunt")}
      </h1>
        <InfoModal
            open={showInfo}
            text={config.infoText}
            onClose={() => setShowInfo(false)}
        />
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
