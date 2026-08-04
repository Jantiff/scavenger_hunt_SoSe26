import React from "react";
import "./Popup.css";
import AppButton from "./buttons/AppButton";

export default function Popup({
  open,
  text,
  onClose,
  onConfirm,
  confirmMode = false,
  confirmText = "OK",
  cancelText = "Abbrechen",
}) {
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
                {confirmText}
              </AppButton>
              <AppButton 
                variant="neutral" 
                onClick={onClose}
              >
                {cancelText}
              </AppButton>
            </>
          ) : (
            <AppButton 
              variant="green" 
              onClick={onClose}
            >
              OK
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
}
