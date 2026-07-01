import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type {ActivationState} from "./Activate.types.ts";
import {activateRequest} from "../../services/authService.ts";
import "./Activate.styles.css"

export default function Activate() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [state, setState] = useState<ActivationState>({
        status: "loading",
        message: "Se verifică token-ul de activare...",
    });

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            return;
        }

        activateRequest(token)
            .then(() => {
                setState({
                    status: "success",
                    message: "Contul tău a fost activat cu succes! Vei fi redirecționat...",
                });
                setTimeout(() => navigate("/"), 2000);
            })
            .catch((err: unknown) => {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Activarea a eșuat. Token invalid sau expirat.";
                setState({ status: "error", message });
            });
    }, []);

    return (
        <div className="activate-page">
            <header className="activate-page__header">
                <div className="activate-page__header-inner">
                    <Link to="/" className="activate-page__logo">
                        <img src="logo.png" alt="Park a Lot Logo" className="activate-page__logo-img" />
                    </Link>
                </div>
            </header>

            <div className="activate-page__body">
                <div className={`activate-card activate-card--${state.status}`}>

                    {state.status === "loading" && (
                        <>
                            <div className="activate-card__spinner" />
                            <h2 className="activate-card__title">Se activează contul</h2>
                            <p className="activate-card__message">{state.message}</p>
                        </>
                    )}

                    {state.status === "success" && (
                        <>
                            <svg className="activate-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                            </svg>
                            <h2 className="activate-card__title">Cont activat!</h2>
                            <p className="activate-card__message">{state.message}</p>
                        </>
                    )}

                    {state.status === "error" && (
                        <>
                            <svg className="activate-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
                            </svg>
                            <h2 className="activate-card__title">Activare eșuată</h2>
                            <p className="activate-card__message">{state.message}</p>
                            <Link to="/register" className="activate-card__btn">
                                Încearcă din nou
                            </Link>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}