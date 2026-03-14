export interface RegisterFormState {
    name: string;
    email: string;
    password: string;
    error: string;
    loading: boolean;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
}