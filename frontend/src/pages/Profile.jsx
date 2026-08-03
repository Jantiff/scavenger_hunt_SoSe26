import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Profile.css";
import { AuthContext } from "../AuthContext";
import AppButton from "../components/buttons/AppButton";
import {
  FaChevronDown,
  FaMoon,
  FaSun,
} from "react-icons/fa";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, authFetch } = React.useContext(AuthContext);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleSave = async () => {
    
    try {
      const resp = await authFetch("/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          language: i18n.language,
          dark_mode: darkMode,
        }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      
    } catch (err) {
      console.error(err);
      
    }
  };


  return (
    <div className="profile-container">
      <h1 className="heading">{t("profile")}</h1>
      <div className="button-column">
        {user ? (
          <>
            <div className="account-details">
              <div className="account-field">
                <span className="account-label">
                  {t("email")}:
                </span>
                <div className="account-value">
                  {user.email}
                </div>
              </div>
              <div className="account-field">
                <span className="account-label">
                  {t("username")}:
                </span>
                <div className="account-value">
                  {user.username}
                </div>
              </div>
            </div>
            {/*}
            <AppButton
              fullWidth
              onClick={() => navigate("/change-password")}
            >
              {t("change_password")}
            </AppButton>
            */}
          </>
        ) : (
          <>
            <AppButton
              fullWidth
              variant="green"
              onClick={() => navigate("/login")}
            >
              {t("login")}
            </AppButton>
            <AppButton
              fullWidth
              onClick={() => navigate("/register")}
            >
              {t("register")}
            </AppButton>
          </>
        )}
      </div>

      {/* choose language */}
      <div className="language-container">
        <label className="language-label">{t("language")}:</label>
        <div className="language-select-wrapper">
          <select
            className="language-select"
            value={i18n.language}
            onChange={(e) => {
              i18n.changeLanguage(e.target.value);
              handleSave();
            }}
          >
            <option value="de">{t("german")}</option>
            <option value="en">{t("english")}</option>
          </select>

          <FaChevronDown
            className="language-select-icon"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* darkmode button */}
      <div className="darkmode-container">
        <span className="darkmode-label">
          {t("dark_mode")}:
        </span>
        <AppButton
          fullWidth
          icon={
            darkMode ? (
              <FaSun
              className="darkmode-icon"
              aria-hidden="true"
              /> 
            ) : (
              <FaMoon
                className="darkmode-icon"
                aria-hidden="true"
              />
          )}
          onClick={() => {
            setDarkMode(!darkMode);
            handleSave();
          }}
        >
            {darkMode ? t("deactivate") : t("activate")}
        </AppButton>
      </div>

      {/* logout button */}
      {user && (
        <div className="logout-container">
          <AppButton
            fullWidth
            variant="red"
            onClick={logout}
          >
            {t("logout")}
          </AppButton>
        </div>
      )}
    </div>
  );
}
