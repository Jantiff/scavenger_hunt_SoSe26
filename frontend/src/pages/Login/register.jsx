import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/buttons/AppButton";
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
      <form onSubmit={handleSubmit}>
        <h1>{t("register")}</h1>
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
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          className="input-field"
          type="username"
          placeholder={t("username")}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <AppButton 
          fullWidth
          variant="green"
          type="submit"
        >
          {t("register")}
        </AppButton>
      </form>
    </div>
  );
}