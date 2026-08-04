import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import MapComponent from "../../components/MapComponent.jsx";
import { getCurrentLocation } from "../../utils/geolocation";
import { getDistanceFromLatLonInMeters } from "../../utils/distance";
import usePopup from "../../components/usePopup";
import Popup from "../../components/Popup";
import "./PlayHunt.css";
import { QrScannerModal } from "../../features/qr-scanner/index.js";
import { FaQrcode } from "react-icons/fa";
import AppButton from "../../components/buttons/AppButton";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function PlayHunt() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { huntCode } = useParams();
  const { authFetch } = useContext(AuthContext);

  const [hunt, setHunt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const { popup, showAlert, showConfirm, handleClose, handleConfirm } =
    usePopup();

  useEffect(() => {
    if (!huntCode) {
      navigate("/");
      return;
    }

    async function loadHunt() {
      try {
        setIsLoading(true);
        const [huntRes, cluesRes, nextClueRes] = await Promise.all([
          authFetch(`/hunts/by-code/${huntCode}`),
          authFetch(`/hunts/by-code/${huntCode}/clues`),
          authFetch(`/hunts/by-code/${huntCode}/current-clue`),
        ]);

        if (!huntRes.ok || !cluesRes.ok) {
          throw new Error("Failed to fetch hunt or clues");
        }

        const huntData = await huntRes.json();
        const cluesData = await cluesRes.json();

        setHunt(huntData);
        setQuestions(cluesData);
        const nextClue = await nextClueRes.json();
        if (nextClue) {
          const idx = cluesData.findIndex(
            (clue) => clue.id === nextClue.current_clue_id,
          );
          setCurrentQuestionIndex(idx >= 0 ? idx : 0);
        }
      } catch (err) {
        console.error("Failed to load hunt", err);
        await showAlert(t("error_loading_hunt"));
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadHunt();
  }, [huntCode, authFetch, navigate]);

  async function saveClueProgress(huntCode, clueId) {
    const res = await authFetch(`/hunts/by-code/${huntCode}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clue_id: clueId }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to record progress");
    }
  }

  const completeCurrentQuestion = async (
    currentQuestion,
  ) => {
    try{
      await saveClueProgress(huntCode, currentQuestion.id);
    } catch (error) {
      
      console.error(
        "Failed to save clue progress:",
        error
      );

      await showAlert(
        "The progress could not be saved.",
      );
      
      return;
    }

    if (currentQuestionIndex + 1 < questions.length) {

      setCurrentQuestionIndex(currentQuestionIndex + 1);

      setUserAnswer("");
      setShowHint(false);
    } else {
      setGameCompleted(true);
    }
  }

  const handleAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];

    let isCorrect = false;

    if (currentQuestion.answer_type === "gps") {
      if (!userAnswer.lat || !userAnswer.lng) {
        showAlert(t("get_current_location"));
        return;
      }

      const correctCoords = currentQuestion.answer_gps_coordinates;
      const tolerance = parseFloat(currentQuestion.answer_gps_radius); // in Metern

      const distance = getDistanceFromLatLonInMeters(
        userAnswer.lat,
        userAnswer.lng,
        parseFloat(correctCoords.lat),
        parseFloat(correctCoords.lng),
      );

      isCorrect = distance <= tolerance;
    } else {
      // TEXT & MULTIPLE CHOICE
      if (!userAnswer.trim()) {
        showAlert(t("please_enter_answer"));
        return;
      }

      isCorrect =
        userAnswer.toLowerCase().trim() ===
        currentQuestion.correct_answer.toLowerCase().trim();
    }

    if (isCorrect) {
      await completeCurrentQuestion(currentQuestion);
    } else {
      showAlert(
        currentQuestion.answer_type === "gps"
          ? t("not_close_enough")
          : t("wrong_answer"),
      );
    }
  };

  const handleQrScanSuccess =  async (
    decodedValue,
  ) => {
    setIsQrScannerOpen(false);

    const currentQuestion = questions[currentQuestionIndex];
    const scannedAnswer =
      typeof decodedValue === "string" 
        ? decodedValue.trim()
        : "";
      
    const correctAnswer = 
      typeof currentQuestion.correct_answer === "string"
        ? currentQuestion.correct_answer.trim()
        : "";

    const isCorrect = 
      scannedAnswer !== "" &&
      correctAnswer !== "" &&
      scannedAnswer === correctAnswer;

    if (!isCorrect) {
      await showAlert(t("wrong_qr_code"));
      return;
    }

    await completeCurrentQuestion(currentQuestion);
  };

  const handleHint = () => {
    setShowHint(true);
  };

  const handleBack = async () => {
    if (currentQuestionIndex > 0) {
      if (
        await showConfirm(
          t("leave_question_confirmation"),
        )
      ) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setUserAnswer("");
        setShowHint(false);
      }
    } else {
      showAlert(t("first_question_alert"));
    }
  };

  const handleEnd = async () => {
    if (await showConfirm(t("end_hunt_confirmation"))) {
      navigate("/");
    }
  };

  const closeHintPopup = () => {
    setShowHint(false);
  };

  if (isLoading) {
    return <div className="play-hunt-container">{t("loading")}</div>;
  }

  if (!hunt || questions.length === 0) {
    return <div className="play-hunt-container">{t("no_questions_found")}</div>;
  }

  if (gameCompleted) {
    return (
      <div className="play-hunt-container">
        <h1>{t("hunt_completed")}</h1>
        <p>
          {t("hunt_completed_message")}
        </p>
        <AppButton
          fullWidth
          variant="green"
          onClick={() => navigate("/")}
        >
          {t("back_to_home")}
        </AppButton>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const renderQuestionReturn = () => {
    switch (currentQuestion.question_type) {
      case "text":
        return <div></div>;
      case "image":
        console.log(currentQuestion.image_url);
        return (
          <div>
            {/\.(mp4|webm|ogg)$/i.test(currentQuestion.image_url) ? (
              <video controls src={`${API_BASE}${currentQuestion.image_url}`} style={{ width: 200 }}>
                Your browser does not support the video element.
              </video>
            ) : (
              <img
                src={`${API_BASE}${currentQuestion.image_url}`}
                style={{ maxWidth: 200 }}
              />
            )}
          </div>
        );
      case "audio":
        return (
          <div>
            <audio
              controls
              src={`${API_BASE}${currentQuestion.audio_url}`}
              style={{ width: 300 }}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case "gps":
        return (
          <MapComponent
            latitude={
              currentQuestion.question_gps_coordinates.lat == ""
                ? 0
                : parseFloat(currentQuestion.question_gps_coordinates.lat)
            }
            longitude={
              currentQuestion.question_gps_coordinates.lng == ""
                ? 0
                : parseFloat(currentQuestion.question_gps_coordinates.lng)
            }
            zoom={15}
            height="300px"
            popupText="Antwort Ort"
            className="map-container"
          />
        );
      default:
        return null;
    }
  };

  const renderAnswerReturn = () => {
    switch (currentQuestion.answer_type) {
      case "text":
        return (
          <div className="answer-section">
            <input
              type="text"
              className="answer-input"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={t("answer_placeholder")}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAnswer();
                }
              }}
            />
          </div>
        );
      case "multiple_choice":
        return (
          <div className="answer-section">
            <div className="multiple-choice-options">
              {currentQuestion.choices.map((option, index) => (
                <div key={index} className="radio-option">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="multiple-choice-answer"
                    value={option}
                    checked={userAnswer === option}
                    onChange={(e) => setUserAnswer(e.target.value)}
                  />
                  <label htmlFor={`option-${index}`} className="radio-label">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case "qr_code":
        return (
          <div className="qr-play-answer">
            <div 
              className="qr-play-answer-icon"
              aria-hidden="true"
            >
              <FaQrcode />
            </div>
            <p className="qr-play-answer-title">
              Find the hidden QR code
            </p>
            <p className="qr-play-answer-description">
              Search for the QR code in your surroundings and scan it to submit your answer.
            </p>
          </div>
        );
      case "gps":
        return (
          <div className="answer-section">
            <h4>Position:</h4>
            <MapComponent
              latitude={userAnswer.lat == null ? 0 : parseFloat(userAnswer.lat)}
              longitude={
                userAnswer.lng == null ? 0 : parseFloat(userAnswer.lng)
              }
              zoom={15}
              height="300px"
              popupText="Antwort Ort"
              className="map-container"
            />
            <AppButton
              fullWidth
              variant="blue"
              onClick={async () => {
                try {
                  const position = await getCurrentLocation(showAlert);
                  console.log(position);
                  if (position) {
                    setUserAnswer({
                      lat: position.latitude,
                      lng: position.longitude,
                    });
                  }
                } catch (error) {
                  // Error is already handled by showAlert in getCurrentLocation
                  console.error("Geolocation error:", error);
                }
              }}
            >
              {t("get_your_position")}
            </AppButton>
          </div>
        );
      default:
        return null;
    }
  };

  const renderHintReturn = () => {
    switch (currentQuestion.hint_type) {
      case "text":
        return (
          <div>
            <p>
              {currentQuestion.hint ||
                t("no_hint_available")}
            </p>
          </div>
        );
      case "image":
        return (
          <div>
            <p>
              {currentQuestion.hint_image_file
                ? ""
                : t("no_hint_available")}
            </p>
            
            {/\.(mp4|webm|ogg)$/i.test(currentQuestion.hint_image_file) ? (
              <video controls src={`${API_BASE}${currentQuestion.hint_image_file}`} style={{ width: 200 }}>
                Your browser does not support the video element.
              </video>
            ) : (
              <img
                src={`${API_BASE}${currentQuestion.hint_image_file}`}
                style={{ maxWidth: 200 }}
              />
            )}
            
          </div>
        );
      case "audio":
        return (
          <div>
            <audio
              controls
              src={`${API_BASE}${currentQuestion.hint_audio_file}`}
              style={{ width: 300 }}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case "gps":
        return (
          <div>
            <p>
              {currentQuestion.hint_gps_coordinates
                ? ""
                : t("no_hint_available")}
            </p>
            {currentQuestion.hint_gps_coordinates && (
              <MapComponent
                latitude={
                  parseFloat(currentQuestion.hint_gps_coordinates.lat) || 0
                }
                longitude={
                  parseFloat(currentQuestion.hint_gps_coordinates.lng) || 0
                }
                zoom={15}
                height="250px"
                popupText="Hinweis Ort"
                className="map-container"
              />
            )}
          </div>
        );
      default:
        return (
          <div>
            <p>
              {currentQuestion.hint ||
                t("no_hint_available")}
            </p>
          </div>
        );
    }
  };
  return (
    <div className="play-hunt-container">
      <h1 className="play-hunt-title">{hunt.name}</h1>

      <section className="play-hunt-card">
        <div className="progress-info">
          {t("question")} {currentQuestionIndex + 1} {t("of")} {questions.length}
        </div>

        <div className="question-section">
          <div className="question-text">
            <h2>{currentQuestion.description}</h2>
          </div>
          {renderQuestionReturn()}
          <hr className="section-divider" /> 
          {renderAnswerReturn()}
          <div className="button-group">
            <div className="play-action play-action-primary">
              {currentQuestion.answer_type === "qr_code" ? (
                <AppButton
                  icon={<FaQrcode />}
                  fullWidth
                  variant="blue"
                  onClick={() => setIsQrScannerOpen(true)}
                >
                  <FaQrcode aria-hidden="true" />
                  <span>Scan QR Code</span>
                </AppButton>
              ) : (
                <AppButton
                  fullWidth
                  variant="green"
                  onClick={handleAnswer}
                >
                  {t("submit_answer")}
                </AppButton>
              )}
            </div>

            <div className="play-action play-action-primary">
              <AppButton
                fullWidth
                variant="blue"
                onClick={handleHint}
              >
                {t("hint")}
              </AppButton>
            </div>

            <hr className="section-divider play-action-divider" />

            <div className="play-action play-action-back">
              <AppButton
                fullWidth
                onClick={handleBack}
              >
                {t("back")}
              </AppButton>
            </div>

            <div className="play-action play-action-end">
              <AppButton
                fullWidth
                variant="red"
                onClick={handleEnd}
              >
                {t("end")}
              </AppButton>
            </div>
          </div>
        </div>
      </section>

      {/* Hinweis Popup */}
      {showHint && (
        <div className="popup-overlay" onClick={closeHintPopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="hint-content">
              <h3>{t("hint")}</h3>
              {renderHintReturn()}
              <AppButton
                fullWidth
                onClick={closeHintPopup}
              >
                {t("close")}
              </AppButton>
            </div>
          </div>
        </div>
      )}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleQrScanSuccess}
      />
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
