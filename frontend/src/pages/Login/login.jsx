import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import AppButton from "../../components/buttons/AppButton";
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
      <form onSubmit={handleSubmit}>
        <h1>{t("login")}</h1>
        <input
          className="input-field"
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="input-field"
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <AppButton 
          fullWidth
          variant="green"
          type="submit">
          {t("login")}
        </AppButton>
      </form>
    </div>
  );
}