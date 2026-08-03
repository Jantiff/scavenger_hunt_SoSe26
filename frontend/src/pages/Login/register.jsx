import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/buttons/AppButton"
import AppInput from "../../components/shared/AppInput";
import "./register.css";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });
    if (res.ok) {
      navigate("/login");
    } else {
      const errorData = await res.json();
      alert("ERROR: " + (errorData.detail || t("registration_error")));
    }
  };

  return (
    <div className="register-container">
      <form 
        className="register-form"
        onSubmit={handleSubmit}
      >
        <h1>{t("register")}</h1>
        <div className="register-inputs">
          <AppInput
            type="text"
            name="username"
            autoComplete="username"
            placeholder={t("username")}
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <AppInput
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t("email")}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <AppInput
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder={t("password")}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <AppButton 
          size="medium"
          variant="green"
          type="submit"
          className="register-submit-button"
        >
          {t("register")}
        </AppButton>
      </form>
    </div>
  );
}