import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import AppButton from "../../components/buttons/AppButton";
import AppInput from "../../components/shared/AppInput";
import "./login.css";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();

    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);

    const res = await fetch(`${API_BASE}/auth/jwt/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data = await res.json();
    if (res.ok) {
      login(data.access_token);
      navigate("/profile");
    } else {
      console.error("Login failed:", data);
      alert("ERROR: " + (data.detail || t("login_error")));
    }
  };

  return (
    <div className="login-container">
      <form 
        className="login-form"
        onSubmit={handleSubmit}
      >
        <h1>{t("login")}</h1>
        <div className="login-inputs">
          <AppInput
            type="email"
            name="email"
            autocomplete="email"
            placeholder={t("email")}
            value={email}
          onChange={e => setEmail(e.target.value)}
          required
          />
          <AppInput
            type="password"
            name="password"
            autocomplete="current-password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <AppButton 
          size="medium"
          variant="green"
          type="submit"
          className="login-submit-button"
        >
          {t("login")}
        </AppButton>
      </form>
    </div>
  );
}