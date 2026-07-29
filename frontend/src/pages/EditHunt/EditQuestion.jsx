import React, {
  useState,
  useEffect,
  useContext,
  useRef
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import QRCode from "react-qr-code";
import usePopup from "../../components/usePopup";
import Popup from "../../components/Popup";
import "./EditQuestion.css";
import MapComponent from "../../components/MapComponent.jsx";
import { AuthContext } from "../../AuthContext";
import { getCurrentLocation } from "../../utils/geolocation";

const API_BASE = import.meta.env.VITE_API_BASE;

// Function to create a random QR code answer value
const createQrAnswerValue = () => {
  const randomBytes = new Uint8Array(16);
  
  crypto.getRandomValues(randomBytes);
  const randomToken = Array.from(
    randomBytes,
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("");

  return `scanvenger-clue:${randomToken}`;
};

export default function EditQuestion() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const huntId = params.get("hunt");
  const questionId = params.get("clue");
  const { authFetch } = useContext(AuthContext);
  const { popup, showAlert, handleClose, handleConfirm } = usePopup();
  
  const qrCodePreviewRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isQuestionVideoFile, setIsQuestionVideoFile] = useState(false);

  const [previewHuntUrl, setPreviewHuntUrl] = useState("");
  const [hintImageFile, setHintImageFile] = useState(null);
  const [isHintVideoFile, setIsHintVideoFile] = useState(false);

  const [audioFile, setAudioFile] = useState(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState("");

  const [hintAudioFile, setHintAudioFile] = useState(null);
  const [previewHintAudioUrl, setPreviewHintAudioUrl] = useState("");

  const [question, setQuestion] = useState({
    text: "",
    answer: "",
    hint: "",
    questionType: "text", // text, image, audio, gps
    answerType: "text", // text, multiple_choice, gps
    hintType: "text", // text, image, audio, gps
    imageFile: null,
    audioFile: null,
    hintImageFile: null,
    hintAudioFile: null,
    questionGpsCoordinates: { lat: "", lng: "" },
    answerGpsCoordinates: { lat: "", lng: "" },
    answerGpsRadius: null,
    hintGpsCoordinates: { lat: "", lng: "" },
    multipleChoiceOptions: ["", "", ""],
    currentOptionIndex: 0, // for multiple choice
  });

  useEffect(() => {
    if (!huntId || !questionId) {
      console.error("Hunt ID or Question ID is missing");
      return;
    }
    async function load() {
      try {
        const res = await authFetch(`/hunts/${huntId}/clues/${questionId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        console.log("Loaded question:", data);

        setQuestion((prev) => ({
          ...prev,
          text: data.description || "",
          hint: data.hint || "",
          answer: 
            data.answer_type || "qr_code"
            ? data.correct_answer || createQrAnswerValue()
            : data.correct_answer || "",

          imageFile: data.image_url || null,
          audioFile: data.audio_url || null,
          questionGpsCoordinates: data.question_gps_coordinates || {
            lat: "",
            lng: "",
          },

          hintType: data.hint_type || "text",
          hintImageFile: data.hint_image_file || null,
          hintAudioFile: data.hint_audio_file || null,
          hintGpsCoordinates: data.hint_gps_coordinates || { lat: "", lng: "" },
          hintGpsRadius: data.hint_gps_radius || null,

          questionType: data.question_type || "text",
          answerType: data.answer_type || "text",
          answerGpsCoordinates: data.answer_gps_coordinates || {
            lat: "",
            lng: "",
          },
          answerGpsRadius: data.answer_gps_radius || null,
          multipleChoiceOptions: Array.isArray(data.choices)
            ? data.choices
            : ["", "", ""],
          currentOptionIndex: Array.isArray(data.choices)
            ? data.choices.findIndex((choice) => choice === data.correct_answer)
            : 0,
        }));
        setPreviewUrl(`${API_BASE}${data.image_url || ""}`);
        setPreviewHuntUrl(`${API_BASE}${data.hint_image_file || ""}`);
        setPreviewAudioUrl(`${API_BASE}${data.audio_url || ""}`);
        setPreviewHintAudioUrl(`${API_BASE}${data.hint_audio_file || ""}`);
        if (data.image_url) {
          const isVideo = /\.(mp4|webm|ogg)$/i.test(data.image_url);
          setIsQuestionVideoFile(isVideo);
        }
        if (data.hint_image_file) {
          const isVideo = /\.(mp4|webm|ogg)$/i.test(data.hint_image_file);
          setIsHintVideoFile(isVideo);
        }
        console.log("Question loaded successfully:", question);
      } catch (error) {
        console.error("Error loading question:", error);
      }
    }
    load();
  }, [huntId, questionId, authFetch]);

  // Function to handle question type change
  const handleQuestionTypeChange = (type) => {
    setQuestion((prev) => ({ ...prev, questionType: type }));
  };

  const handleAnswerTypeChange = (type) => {
    setQuestion((prev) => ({
      ...prev,
      answerType: type,
      answer: 
        type === "qr_code"
          ? createQrAnswerValue()
          : prev.answerType === "qr_code"
            ? ""
            : prev.answer,
    }));
  };

  // Function to handle QR code download
  const handleDownloadQrCode = () => {
    const qrCodeContainer = qrCodePreviewRef.current;
    const qrCodeSvg = qrCodeContainer?.querySelector("svg");

    if (!qrCodeSvg) {
      showAlert("QR-Code could not be downloaded.");
      return;
    }

    const clonedSvg = qrCodeSvg.cloneNode(true);

    clonedSvg.setAttribute(
      "xmlns",
      "http://www.w3.org/2000/svg"
    );

    const serializedSvg = 
      new XMLSerializer().serializeToString(clonedSvg);

    const svgBlob = new Blob(
      [serializedSvg],
      {
        type: "image/svg+xml;charset=utf-8" 
      },
    );

    const downloadUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = 
      `hunt-${huntId}-clue-${questionId}-qr-code.svg`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
  };

  const handleHintTypeChange = (type) => {
    setQuestion((prev) => ({ ...prev, hintType: type }));
  };

  const handleHintImageChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    if (file) {
      const isVideo = /\.(mp4|webm|ogg)$/i.test(file.name);
      setIsHintVideoFile(isVideo); 
      setHintImageFile(file);
      setPreviewHuntUrl(URL.createObjectURL(file));
    }
  };

  const handleHintImageUpload = async (e) => {
    const form = new FormData();
    form.append("file", hintImageFile);

    const res = await authFetch(
      `/hunts/${huntId}/clues/${questionId}/hint-image`,
      { method: "POST", body: form },
    );

    if (!res.ok) {
      const err = await res.text();
      return console.error("Hint upload failed:", err);
    }
    const { hint_image_file } = await res.json();
    setQuestion((q) => ({ ...q, hintImageFile: hint_image_file }));
    return hint_image_file;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    if (file) {
      const isVideo = /\.(mp4|webm|ogg)$/i.test(file.name);
      setIsQuestionVideoFile(isVideo); 
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadQuestionImage = async () => {
    if (!imageFile) return await showAlert("Choose an image first");
    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await authFetch(`/hunts/${huntId}/clues/${questionId}/image`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.text();
      return console.error("Upload failed:", err);
    }
    const { image_url } = await res.json();
    setQuestion((prev) => ({ ...prev, imageFile: image_url }));
    return image_url;
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected audio file:", file);
    setAudioFile(file);
    setPreviewAudioUrl(URL.createObjectURL(file));
  };

  const handleHintAudioChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected hint audio file:", file);
    setHintAudioFile(file);
    setPreviewHintAudioUrl(URL.createObjectURL(file));
  };

  const handleMultipleChoiceChange = (index, value) => {
    const newOptions = [...question.multipleChoiceOptions];
    newOptions[index] = value;
    setQuestion((prev) => ({ ...prev, multipleChoiceOptions: newOptions }));
  };

  const addMultipleChoiceOption = () => {
    setQuestion((prev) => ({
      ...prev,
      multipleChoiceOptions: [...prev.multipleChoiceOptions, ""],
    }));
  };

  const removeMultipleChoiceOption = (index) => {
    if (question.multipleChoiceOptions.length > 2) {
      const newOptions = question.multipleChoiceOptions.filter(
        (_, i) => i !== index,
      );
      setQuestion((prev) => ({
        ...prev,
        multipleChoiceOptions: newOptions,
        correctOptionIndex:
          prev.correctOptionIndex >= index
            ? Math.max(0, prev.correctOptionIndex - 1)
            : prev.correctOptionIndex,
      }));
    }
  };

  const clearOtherFields = () => {
    switch (question.questionType) {
      case "text":
        question.imageFile = null;
        question.audioFile = null;
        question.questionGpsCoordinates = { lat: "", lng: "" };
        break;
      case "image":
        question.audioFile = null;
        question.questionGpsCoordinates = { lat: "", lng: "" };
        break;
      case "audio":
        question.imageFile = null;
        question.questionGpsCoordinates = { lat: "", lng: "" };
        break;
      case "gps":
        question.imageFile = null;
        question.audioFile = null;
        break;
      default:
        break;
    }
    switch (question.answerType) {
      case "text":
        question.multipleChoiceOptions = [];
        question.answerGpsCoordinates = { lat: "", lng: "" };
        question.answerGpsRadius = null;
        break;
      case "multiple_choice":
        question.answer =
          question.multipleChoiceOptions[parseInt(question.currentOptionIndex)];
        question.answerGpsCoordinates = { lat: "", lng: "" };
        question.answerGpsRadius = null;
        break;
      case "gps":
        question.answer = "";
        question.multipleChoiceOptions = [];
        break;
      case "qr_code":
        question.multipleChoiceOptions = [];
        question.answerGpsCoordinates = { lat: "", lng: "" };
        question.answerGpsRadius = null;
        break;
      default:
        break;
    }
    switch (question.hintType) {
      case "text":
        question.hintImageFile = null;
        question.hintAudioFile = null;
        question.hintGpsCoordinates = { lat: "", lng: "" };
        break;
      case "image":
        question.hint = "";
        question.hintAudioFile = null;
        question.hintGpsCoordinates = { lat: "", lng: "" };
        break;
      case "audio":
        question.hint = "";
        question.hintImageFile = null;
        question.hintGpsCoordinates = { lat: "", lng: "" };
        break;
      case "gps":
        question.hint = "";
        question.hintImageFile = null;
        question.hintAudioFile = null;
        break;
      default:
        break;
    }
  };

  const uploadQuestionAudio = async () => {
    if (!audioFile) throw new Error("No audio selected");
    const formData = new FormData();
    formData.append("file", audioFile);

    const res = await authFetch(`/hunts/${huntId}/clues/${questionId}/audio`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error("Audio upload failed: " + txt);
    }
    const { audio_url } = await res.json();
    return audio_url;
  };

  const uploadHintAudio = async () => {
    if (!hintAudioFile) throw new Error("No hint audio selected");
    const formData = new FormData();
    formData.append("file", hintAudioFile);

    const res = await authFetch(
      `/hunts/${huntId}/clues/${questionId}/hint-audio`,
      { method: "POST", body: formData },
    );
    if (!res.ok) {
      const txt = await res.text();
      throw new Error("Hint audio upload failed: " + txt);
    }
    const { hint_audio_file } = await res.json();
    return hint_audio_file;
  };

  const saveChange = async () => {
    clearOtherFields();
    if (question.answerGpsRadius <= 5) {
      question.answerGpsRadius = 5;
    }
    try {
      let finalQuestionImageUrl = question.imageFile;
      if (imageFile instanceof File) {
        finalQuestionImageUrl = await uploadQuestionImage();
      }

      let finalHintImageUrl = question.hintImageFile;
      if (hintImageFile instanceof File) {
        finalHintImageUrl = await handleHintImageUpload();
      }

      let finalQuestionAudioUrl = question.audioFile;
      if (audioFile instanceof File) {
        finalQuestionAudioUrl = await uploadQuestionAudio();
      }

      let finalHintAudioUrl = question.hintAudioFile;
      if (hintAudioFile instanceof File) {
        finalHintAudioUrl = await uploadHintAudio();
      }

      const res = await authFetch(`/hunts/${huntId}/clues/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: question.text,
          correct_answer: question.answer,
          hint: question.hint,
          question_type: question.questionType,
          answer_type: question.answerType,
          hint_type: question.hintType,
          image_url: finalQuestionImageUrl,
          audio_url: finalQuestionAudioUrl,
          question_gps_coordinates: question.questionGpsCoordinates,
          answer_gps_coordinates: question.answerGpsCoordinates,
          answer_gps_radius: question.answerGpsRadius || null,
          hint_image_file: finalHintImageUrl,
          hint_audio_url: finalHintAudioUrl,
          hint_gps_coordinates: question.hintGpsCoordinates,
          hint_gps_radius: question.hintGpsRadius || null,
          choices: question.multipleChoiceOptions,
        }),
      });

      console.log("uploaded question:", {
        description: question.text,
        image_url: finalQuestionImageUrl,
        audio_url: question.audioFile,
        question_gps_coordinates: question.questionGpsCoordinates,
        answer_gps_coordinates: question.answerGpsCoordinates,
        answer_gps_radius: question.answerGpsRadius || null,
        hint_image_file: finalHintImageUrl,
        hint_audio_url: question.hintAudioFile || null,
        hint_gps_coordinates: question.hintGpsCoordinates,
        hint_gps_radius: question.hintGpsRadius || null,
        choices: question.multipleChoiceOptions,
      });

      if (!res.ok) throw new Error(await res.text());
      navigate(-1);
    } catch (error) {
      console.error("Error saving question:", error);
      await showAlert("Fehler beim Speichern der Frage");
    }
  };

  const renderQuestionContent = () => {
    switch (question.questionType) {
      case "image":
        return (
          <div>
            <input
              type="file"
              accept="image/*,video/*" 
              onChange={handleImageChange}
              className="file-input"
            />
            {isQuestionVideoFile ? (
              <video controls src={previewUrl} style={{ width: 200 }}>
                Your browser does not support the video element.
              </video>
            ) : (
              <img
                src={previewUrl}
                style={{ maxWidth: 200 }}
                alt="Preview"
              />
            )}
          </div>
        );
      case "audio":
        return (
          <div className="media-upload">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="file-input"
            />
            {previewAudioUrl && (
              <audio controls src={previewAudioUrl} style={{ width: 300 }}>
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        );
      case "gps":
        return (
          <div className="gps-input">
            <h4>Position:</h4>
            <MapComponent
              latitude={
                question.questionGpsCoordinates.lat == ""
                  ? 0
                  : parseFloat(question.questionGpsCoordinates.lat)
              }
              longitude={
                question.questionGpsCoordinates.lng == ""
                  ? 0
                  : parseFloat(question.questionGpsCoordinates.lng)
              }
              zoom={15}
              height="300px"
              popupText="Frage Ort"
              className="map-container"
              allowManualPin={true}
              onMapClick={(lat, lng) => {
                setQuestion({
                  ...question,
                  questionGpsCoordinates: {
                    lat: String(lat),
                    lng: String(lng),
                  },
                });
              }}
            />
            <button
              className="main-button main-button-blue"
              onClick={async () => {
                try {
                  const position = await getCurrentLocation(showAlert);
                  console.log(position);
                  if (position) {
                    setQuestion({
                      ...question,
                      questionGpsCoordinates: {
                        lat: String(position.latitude),
                        lng: String(position.longitude),
                      },
                    });
                  }
                } catch (error) {
                  console.error("Geolocation error:", error);
                }
              }}
            >
              {t("get_your_position")}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAnswerContent = () => {
    switch (question.answerType) {
      case "text":
        return (
          <input
            id="answer-input"
            type="text"
            className="EditQuestion-input"
            value={question.answer}
            onChange={(e) =>
              setQuestion((prev) => ({ ...prev, answer: e.target.value }))
            }
            placeholder={t("answer_placeholder")}
          />
        );
      case "multiple_choice":
        return (
          <div className="multiple-choice-container">
            {question.multipleChoiceOptions.map((option, index) => (
              <div key={index} className="multiple-choice-option">
                <input
                  type="radio"
                  name="correct-answer"
                  checked={question.currentOptionIndex === index}
                  onChange={() =>
                    setQuestion((prev) => ({
                      ...prev,
                      currentOptionIndex: index,
                    }))
                  }
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) =>
                    handleMultipleChoiceChange(index, e.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  className="EditQuestion-input"
                />
                {question.multipleChoiceOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeMultipleChoiceOption(index)}
                    className="remove-option-btn"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMultipleChoiceOption}
              className="main-button main-button-green"
            >
              + {t("add_option")}
            </button>
          </div>
        );
      case "qr_code":
        return (
          <div className="qr-code-container">
            <p className="qr-code-description">
              Download the QR code and place it at the location where you want the players to scan it.
            </p>
            <div
              ref={qrCodePreviewRef}
              className="qr-code-preview"
            >
              <QRCode
                value={question.answer}
                size={220}
                level="M"
              />
            </div>
            <button
              type="button"
              className="main-button main-button-blue"
              onClick={handleDownloadQrCode}
            >
              qr-code download
            </button>
          </div>
        );  
      case "gps":
        return (
          <div className="gps-input">
            <h4>Position:</h4>
            <MapComponent
              latitude={
                question.answerGpsCoordinates.lat == ""
                  ? 0
                  : parseFloat(question.answerGpsCoordinates.lat)
              }
              longitude={
                question.answerGpsCoordinates.lng == ""
                  ? 0
                  : parseFloat(question.answerGpsCoordinates.lng)
              }
              radius={question.answerGpsRadius}
              zoom={15}
              height="300px"
              popupText="Antwort Ort"
              className="map-container"
              allowManualPin={true}
              onMapClick={(lat, lng) => {
                setQuestion({
                  ...question,
                  answerGpsCoordinates: {
                    lat: String(lat),
                    lng: String(lng),
                  },
                });
              }}
            />
            <button
              className="main-button main-button-blue"
              onClick={async () => {
                try {
                  const position = await getCurrentLocation(showAlert);
                  console.log(position);
                  if (position) {
                    setQuestion({
                      ...question,
                      answerGpsCoordinates: {
                        lat: String(position.latitude),
                        lng: String(position.longitude),
                      },
                    });
                  }
                } catch (error) {
                  // Error is already handled by showAlert in getCurrentLocation
                  console.error("Geolocation error:", error);
                }
              }}
            >
              {t("get_your_position")}
            </button>
            <h4>{t("radius_for_answer_in_meters")}:</h4>
            <input
              id="answer-input"
              type="number"
              className="EditQuestion-input"
              value={question.answerGpsRadius}
              onChange={(e) =>
                setQuestion((prev) => ({
                  ...prev,
                  answerGpsRadius: e.target.value,
                }))
              }
              placeholder={t("min_5_meters")}
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderHintContent = () => {
    switch (question.hintType) {
      case "text":
        return (
          <input
            type="text"
            className="EditQuestion-input"
            value={question.hint}
            onChange={(e) =>
              setQuestion((prev) => ({ ...prev, hint: e.target.value }))
            }
            placeholder="Hinweis eingeben"
          />
        );
      case "image":
        return (
          <div>
            <input
              type="file"
              accept="image/*,video/*" // Accept both images and videos
              onChange={handleHintImageChange}
              className="file-input"
            />
            {isHintVideoFile ? (
              <video controls src={previewHuntUrl} style={{ width: 200 }}>
                Your browser does not support the video element.
              </video>
            ) : (
              <img
                src={previewHuntUrl}
                style={{ maxWidth: 200 }}
                alt="Preview"
              />
            )}
          </div>
        );
      case "audio":
        return (
          <div className="media-upload">
            <input
              type="file"
              accept="audio/*"
              onChange={handleHintAudioChange}
              className="file-input"
            />
            {previewHintAudioUrl && (
              <audio controls src={previewHintAudioUrl} style={{ width: 300 }}>
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        );
      case "gps":
        return (
          <div className="gps-input">
            <h4>Position:</h4>
            <MapComponent
              latitude={
                question.hintGpsCoordinates.lat == ""
                  ? 0
                  : parseFloat(question.hintGpsCoordinates.lat)
              }
              longitude={
                question.hintGpsCoordinates.lng == ""
                  ? 0
                  : parseFloat(question.hintGpsCoordinates.lng)
              }
              zoom={15}
              height="300px"
              popupText="Hinweis Ort"
              className="map-container"
              allowManualPin={true}
              onMapClick={(lat, lng) => {
                setQuestion({
                  ...question,
                  hintGpsCoordinates: {
                    lat: String(lat),
                    lng: String(lng),
                  },
                });
              }}
            />
            <button
              className="main-button main-button-blue"
              onClick={async () => {
                try {
                  const position = await getCurrentLocation(showAlert);
                  console.log(position);
                  if (position) {
                    setQuestion({
                      ...question,
                      hintGpsCoordinates: {
                        lat: String(position.latitude),
                        lng: String(position.longitude),
                      },
                    });
                  }
                } catch (error) {
                  // Error is already handled by showAlert in getCurrentLocation
                  console.error("Geolocation error:", error);
                }
              }}
            >
              {t("get_your_position")}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="edit-question-container">
      {/* Frage Sektion */}
      <div className="input-group">
        <label htmlFor="question-type">{t("question_type")}:</label>
        <select
          id="question-type"
          value={question.questionType}
          onChange={(e) => handleQuestionTypeChange(e.target.value)}
          className="type-dropdown"
        >
          <option value="text">Text</option>
          <option value="image">{t("image_and_video")}</option>
          <option value="audio">Audio</option>
          <option value="gps">Gps</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="question-input">{t("question")}:</label>
        <input
          id="question-input"
          type="text"
          className="EditQuestion-input"
          value={question.text}
          onChange={(e) =>
            setQuestion((prev) => ({ ...prev, text: e.target.value }))
          }
          placeholder={t("add_question")}
        />
      </div>

      {renderQuestionContent()}

      <hr className="section-divider" />

      {/* Antwort Sektion */}
      <div className="input-group">
        <label htmlFor="answer-type">{t("answer_type")}:</label>
        <select
          id="answer-type"
          value={question.answerType}
          onChange={(e) => handleAnswerTypeChange(e.target.value)}
          className="type-dropdown"
        >
          <option value="text">Text</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="qr_code">QR-Code</option>
          <option value="gps">GPS</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="answer-input">
          {question.answerType === "multiple_choice"
            ? "Antwortoptionen:"
            : question.answerType === "qr_code"
            ? "QR-Code:"
            : "Antwort:"}
        </label>
        {renderAnswerContent()}
      </div>

      <hr className="section-divider" />

      {/* Hinweis Sektion */}
      <div className="input-group">
        <label htmlFor="hint-type">{t("hint_type")}:</label>
        <select
          id="hint-type"
          value={question.hintType}
          onChange={(e) => handleHintTypeChange(e.target.value)}
          className="type-dropdown"
        >
          <option value="text">Text</option>
          <option value="image">{t("image_and_video")}</option>
          <option value="audio">Audio</option>
          <option value="gps">GPS</option>
        </select>
        <div className="hint-content">
          <label htmlFor="hint-input">{t("hint")} (optional):</label>
          {renderHintContent()}
        </div>
      </div>

      {/* Aktionen Sektion */}
      <div className="question-actions">
        <button className="main-button main-button-green" onClick={saveChange}>
          {t("save_and_exit")}
        </button>
        <button
          className="main-button main-button-red"
          onClick={() => navigate(-1)}
        >
          {t("cancel")}
        </button>
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
