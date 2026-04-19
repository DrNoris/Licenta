import type {LoginCredentials} from "../pages/Login/Login.types.ts";

const TOKEN_KEY = "auth_token";
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

//region Token storage
export function saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}
//endregion

//region Parse JWT payload (no verification — server handles that)
export function parseToken<T = Record<string, unknown>>(token: string): T | null {
    try {
        return JSON.parse(atob(token.split(".")[1])) as T;
    } catch {
        return null;
    }
}
//endregion

//region Expiry check
export function isTokenValid(token: string | null): boolean {
    if (!token) return false;
    const payload = parseToken<{ exp: number }>(token);
    if (!payload?.exp) return false;
    return payload.exp > Math.floor(Date.now() / 1000);
}

export function isAuthenticated(): boolean {
    return isTokenValid(getToken());
}

export function logout(): void {
    removeToken();
}
//endregion

//region Login
export async function loginRequest(credentials: LoginCredentials): Promise<void> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? "Email sau parolă incorecte.");
    }

    const { token } = await res.json();
    saveToken(token);
}
//endregion

//region Register
export async function registerRequest(credentials: import("../pages/Register/Register.types.ts").RegisterCredentials): Promise<void> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? "Înregistrarea a eșuat.");
    }
}
//endregion

//region Activate account
export async function activateRequest(token: string): Promise<string> {
    const res = await fetch(`${API_BASE}/api/auth/verify?token=${encodeURIComponent(token)}`, {
        method: "GET",
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? "Activarea a eșuat. Token invalid sau expirat.");
    }

    // Backend returns a fresh JWT so the user is logged in right away
    const { token: jwt } = await res.json();
    saveToken(jwt);
    return jwt;
}
//endregion