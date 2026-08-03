import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Join.css";
import { AuthContext } from "../../AuthContext";
import QrScannerModal from "../../features/qr-scanner/components/QrScannerModal";
import AppButton from "../../components/buttons/AppButton";

export default function Join() {
  const [huntCode, setHuntCode] = useState("");
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { authFetch } = React.useContext(AuthContext);

  const extractHuntCode = (value) => {
    if (!value) return null;

    const trimmedValue = value.trim();

    // If Hunt-Code is directly entered
    if (/^\d{6}$/.test(trimmedValue)) {
      return trimmedValue;
    }

    // Try to parse as URL and extract code from query or path
    try {
      const url = new URL(trimmedValue);

      const codeFromQuery = url.searchParams.get("code");
      if (codeFromQuery && /^\d{6}$/.test(codeFromQuery.trim())) {
        return codeFromQuery.trim();
      }

      const pathSegments = url.pathname.split("/").filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1];

      if (lastSegment && /^\d{6}$/.test(lastSegment.trim())) {
        return lastSegment.trim();
      }
    } catch {
      // Not a valid URL -> test in Regex-Fallback below
    }

    // Fallback: Extract first 6-digit number from the input
    const regexMatch = trimmedValue.match(/\b\d{6}\b/);
    return regexMatch ? regexMatch[0] : null;
  };

  const joinWithCode = async (rawValue) => {
    setError("");

  const cleanedCode = extractHuntCode(rawValue);

  if (!cleanedCode) {
    setError("Invalid input. Please enter a valid 6-digit hunt code or scan a QR code containing the code.");
    return;
  }

  setHuntCode(cleanedCode);
    
    try {
      const res = await authFetch(`/hunts/${cleanedCode}/join`, {
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
      navigate(`/StartHunt/${cleanedCode}`, { state: data });
    } catch (err) {
      console.error(err);
      setError(t("join_failed"));
    } 
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    await joinWithCode(huntCode);
  };

  const handleScanSuccess = async (decodedData) => {
    console.info(
      "[Join] QR code scanned successfully. Decoded text:",
      decodedData
    );

    setShowScanner(false);

    await joinWithCode(decodedData);
  };

  return (
    <div className="join-container">
      <h1 className="heading">{t("join_hunt")}</h1>
      <form className="join-form" onSubmit={handleJoinSubmit}>
        <input
          type="text"
          placeholder={t("enter_hunt_code")}
          value={huntCode}
          onChange={(e) => setHuntCode(e.target.value)}
          required
          className="join-input"
        />
        {error && <div className="error-message-hunt-code">{error}</div>}
        <AppButton
          type="submit"
          fullWidth 
          variant="green">
          {t("join")}
        </AppButton>
        <AppButton
          fullWidth
          variant="blue"
          onClick={() => {
            setError("");
            setShowScanner(true);
          }}
        >
          Scan QR Code
        </AppButton>
        <AppButton
          fullWidth
          variant="neutral"
          onClick={() => navigate(-1)}
        >
          {t("back")}
        </AppButton>
      </form>
      <QrScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}