import { Navigate } from "react-router-dom";
import {isAuthenticated} from "../../services/authService.ts";
import type {AuthGuardProps} from "./AuthGuard.types.ts";

export default function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
    if (!isAuthenticated()) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}