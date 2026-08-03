import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./StartHunt.css";
import { AuthContext } from "../../AuthContext";
import usePopup from "../../components/usePopup";
import Popup from "../../components/Popup";
import QRCode from "react-qr-code";
import AppButton from "../../components/buttons/AppButton";
import HuntDetailsCard from "../../components/starthunt-page/HuntDetailsCard";
import {
  FaPlay,
  FaShareAlt,
  FaTrashAlt,
  FaSignOutAlt,
} from "react-icons/fa";

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
      <HuntDetailsCard hunt={hunt} />
      {error && <div className="error-message-hunt-code">{error}</div>}
      <div className="start-hunt-columns">
        <AppButton
          fullWidth
          size="medium"
          icon={<FaPlay />}
          variant="green"
          onClick={handleStartHunt}
        >
          {t("start_hunt")}
        </AppButton>
        <AppButton
          fullWidth
          size="medium"
          variant="blue"
          icon={<FaShareAlt />}
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
            size="medium"
            variant="red"
            icon={<FaTrashAlt />}
            onClick={() => removeHunt()}
          >
            {t("remove_hunt")}
          </AppButton>
        )}
        <AppButton
          size="medium"
          className="start-hunt-back-button"
          variant="neutral"
          icon={<FaSignOutAlt />}
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
                  onClick={handleCopyLink}
                >
                  {t("copy_link")}
                </AppButton>
                <AppButton
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
