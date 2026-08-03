import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./StartHunt.css";
import { AuthContext } from "../../AuthContext";
import usePopup from "../../components/usePopup";
import Popup from "../../components/Popup";
import QRCode from "react-qr-code";
import AppButton from "../../components/buttons/AppButton";

export default function StartHunt() {
  const { huntCode } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hunt, setHunt] = useState({});
  const { user, authFetch, logout } = useContext(AuthContext);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [error, setError] = useState("");
  const { popup, showAlert, showConfirm, handleClose, handleConfirm } =
    usePopup();

  const shareUrl = `${window.location.origin}/StartHunt/${huntCode}`;

  useEffect(() => {
    console.log(huntCode);
    const fetchHunt = async () => {
      try {
        const response = await authFetch(`/hunts/by-code/${huntCode}`);
        if (!response.ok) {
          throw new Error("Failed to fetch hunt details");
        }
        const data = await response.json();
        setHunt(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching hunt details:", error);
      }
    };
    fetchHunt();
  }, [huntCode]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(t("link_copied"));
    } catch {
      setCopySuccess(t("copy_failed"));
    }
  };

  const handleStartHunt = async () => {
    if (hunt.is_active === false) {
      await showAlert(t("hunt_inactive"));
    } else {
      try {
        const res = await authFetch(`/hunts/${huntCode}/join`, {
          method: "POST",
        });

        if (!res.ok) {
          const errorData = await res.json();
          const errorDetail = errorData.detail || t("join_failed");
          setError(errorDetail);
          return;
        }

        const data = await res.json();
        console.log(data);
      } catch (err) {
        console.error(err);
        setError(t("join_failed"));
      }
      navigate(`/PlayHunt/${huntCode.trim()}`);
    }
  };

  const removeHunt = async () => {
    if (!(await showConfirm(t("leave_hunt_confirmation"))))
      return;
    try {
      const response = await authFetch(`/hunts/by-code/${hunt.code}/leave`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to remove hunt");
      }
      await showAlert(t("left_hunt"));
      navigate(-1);
    } catch (error) {
      console.error("Error removing hunt:", error);
      await showAlert(t("could_not_leave_hunt"));
    }
  };

  return (
    <div className="start-hunt-container">
      <h1 className="heading">{hunt.name}</h1>

      <div className="hunt-details">
        <p>
          <strong>{t("hunt_code")}:</strong> {hunt.code}
        </p>
        <p>
          <strong>{t("hunt_info")}:</strong> {hunt.description}
        </p>
        <p>
          <strong>{t("location")}:</strong> {hunt.place_to_play}
        </p>
        <p>
          <strong>{t("start_point")}:</strong> {hunt.start_point}
        </p>
        <p>
          <strong>{t("creator")}:</strong> {hunt.creator_username}
        </p>
        <p>
          <strong>{t("hunt_status")}:</strong>{" "}
          {hunt.is_active ? t("active") : t("inactive")}
        </p>
        <p>
          <strong>{t("private_hunt")}:</strong>{" "}
          {hunt.private ? t("yes") : t("no")}
        </p>
      </div>
      {error && <div className="error-message-hunt-code">{error}</div>}
      <div className="button-column">
        <AppButton
          fullWidth
          variant="green"
          onClick={handleStartHunt}
        >
          {t("start_hunt")}
        </AppButton>
        <AppButton
          fullWidth
          variant="blue"
          onClick={() => {
            setCopySuccess("");
            setShowSharePopup(true);
          }}
        >
          {t("publish_hunt")}
        </AppButton>
        {user && (
          <AppButton
            fullWidth
            variant="red"
            onClick={() => removeHunt()}
          >
            {t("remove_hunt")}
          </AppButton>
        )}
        <AppButton
          fullWidth
          variant="neutral"
          onClick={() => navigate(-1)}
        >
          {t("back")}
        </AppButton>
        {showSharePopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h2>{t("share_link")}</h2>
              <p>{shareUrl}</p>
              <div className="qr-code-wrapper">
                <QRCode
                  value={shareUrl}
                  size={220}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <div className="popup-buttons">
                <AppButton
                  fullWidth
                  onClick={handleCopyLink}
                >
                  {t("copy_link")}
                </AppButton>
                <AppButton
                  fullWidth
                  variant="neutral"
                  onClick={() => setShowSharePopup(false)}
                >
                  {t("close")}
                </AppButton>
              </div>
              {copySuccess && <p className="copy-feedback">{copySuccess}</p>}
            </div>
          </div>
        )}
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
