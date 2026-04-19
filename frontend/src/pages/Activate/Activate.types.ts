export type ActivationStatus = "loading" | "success" | "error";

export interface ActivationState {
    status: ActivationStatus;
    message: string;
}