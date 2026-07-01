import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type {RegisterFormState} from "./Register.types.ts";
import {registerRequest} from "../../services/authService.ts";
import "./Register.styles.css"

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState<RegisterFormState>({
        name: "",
        email: "",
        password: "",
        error: "",
        loading: false,
    });

    const [success, setSuccess] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setForm((prev) => ({ ...prev, [e.target.id]: e.target.value, error: "" }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!form.name || !form.email || !form.password) {
            setForm((prev) => ({ ...prev, error: "Toate câmpurile sunt necesare." }));
            return;
        }

        setForm((prev) => ({ ...prev, loading: true, error: "" }));

        try {
            await registerRequest({ username: form.name, email: form.email, password: form.password });
            setSuccess("Cont creat cu succes! Redirecționare...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Înregistrarea a eșuat.";
            setForm((prev) => ({ ...prev, error: message, loading: false }));
        }
    };

    return (
        <div className="register-page">
            <header className="register-page__header">
                <div className="register-page__header-inner">
                    <Link to="/" className="register-page__logo">
                        <img src="logo.png" alt="Park a Lot Logo" className="register-page__logo-img" />
                    </Link>
                </div>
            </header>

            <div className="register-page__body">
                <div className="register-card">
                    <h2 className="register-card__title">Înregistrare</h2>

                    {form.error && <div className="register-card__error">{form.error}</div>}
                    {success && <div className="register-card__success">{success}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="register-card__field">
                            <label htmlFor="name" className="register-card__label">Nume</label>
                            <input
                                type="text"
                                id="name"
                                value={form.name}
                                onChange={handleChange}
                                className="register-card__input"
                                placeholder="Introduceți numele"
                                autoComplete="name"
                                disabled={form.loading}
                            />
                        </div>

                        <div className="register-card__field">
                            <label htmlFor="email" className="register-card__label">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={form.email}
                                onChange={handleChange}
                                className="register-card__input"
                                placeholder="Introduceți email-ul"
                                autoComplete="email"
                                disabled={form.loading}
                            />
                        </div>

                        <div className="register-card__field">
                            <label htmlFor="password" className="register-card__label">Parola</label>
                            <input
                                type="password"
                                id="password"
                                value={form.password}
                                onChange={handleChange}
                                className="register-card__input"
                                placeholder="Introduceți parola"
                                autoComplete="new-password"
                                disabled={form.loading}
                            />
                        </div>

                        <div className="register-card__field">
                            <button
                                type="submit"
                                className="register-card__submit"
                                disabled={form.loading}
                            >
                                {form.loading ? "Se înregistrează..." : "Înregistrează-te"}
                            </button>
                        </div>

                        <div className="register-card__footer">
                            <p>
                                Ai deja un cont?{" "}
                                <Link to="/login" className="register-card__login-link">
                                    Autentifică-te aici
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}