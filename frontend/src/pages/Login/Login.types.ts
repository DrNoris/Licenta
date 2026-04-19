export interface LoginFormState {
    email: string;
    password: string;
    error: string;
    loading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}