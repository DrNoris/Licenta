import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LoginFormState } from "./Login.types.ts";
import {loginRequest} from "../../services/authService.ts";
import "./Login.styles.css";

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState<LoginFormState>({
        email: "",
        password: "",
        error: "",
        loading: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setForm((prev) => ({ ...prev, [e.target.id]: e.target.value, error: "" }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!form.email || !form.password) {
            setForm((prev) => ({ ...prev, error: "Toate câmpurile sunt necesare." }));
            return;
        }

        setForm((prev) => ({ ...prev, loading: true, error: "" }));

        try {
            await loginRequest({ email: form.email, password: form.password });
            navigate("/");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Autentificare eșuată.";
            setForm((prev) => ({ ...prev, error: message, loading: false }));
        }
    };

    return (
        <div className="login-page">
            <header className="login-page__header">
                <div className="login-page__header-inner">
                    <Link to="/" className="login-page__logo">
                        <img src="logo.png" alt="Park a Lot Logo" className="login-page__logo-img" />
                    </Link>
                </div>
            </header>

            <div className="login-page__body">
                <div className="login-card">
                    <h2 className="login-card__title">Autentificare</h2>

                    {form.error && <div className="login-card__error">{form.error}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="login-card__field">
                            <label htmlFor="email" className="login-card__label">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={form.email}
                                onChange={handleChange}
                                className="login-card__input"
                                placeholder="Introdu email-ul"
                                autoComplete="email"
                                disabled={form.loading}
                            />
                        </div>

                        <div className="login-card__field">
                            <label htmlFor="password" className="login-card__label">Parola</label>
                            <input
                                type="password"
                                id="password"
                                value={form.password}
                                onChange={handleChange}
                                className="login-card__input"
                                placeholder="Introdu parola"
                                autoComplete="current-password"
                                disabled={form.loading}
                            />
                        </div>

                        <div className="login-card__field">
                            <button
                                type="submit"
                                className="login-card__submit"
                                disabled={form.loading}
                            >
                                {form.loading ? "Se autentifică..." : "Autentifică-te"}
                            </button>
                        </div>

                        <div className="login-card__footer">
                            <p>
                                Nu ai cont?{" "}
                                <Link to="/register" className="login-card__register-link">
                                    Înregistrează-te aici
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;