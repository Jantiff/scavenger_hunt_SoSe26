import React from "react";
import { useTranslation } from "react-i18next";
import "./Popup.css";
import AppButton from "./buttons/AppButton";

export default function Popup({
  open,
  text,
  onClose,
  onConfirm,
  confirmMode = false,
  confirmText,
  cancelText,
}) {
  const { t } = useTranslation();
  const displayedConfirmText = confirmText || t("ok");
  const displayedCancelText = cancelText || t("cancel");

  if (!open) return null;
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <div className="popup-text">{text}</div>
        <div className="popup-actions">
          {confirmMode ? (
            <>
              <AppButton 
                variant="green" 
                onClick={onConfirm}
              >
                {displayedConfirmText}
              </AppButton>
              <AppButton 
                variant="neutral" 
                onClick={onClose}
              >
                {displayedCancelText}
              </AppButton>
            </>
          ) : (
            <AppButton 
              variant="green" 
              onClick={onClose}
            >
              {t("ok")}
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
}
