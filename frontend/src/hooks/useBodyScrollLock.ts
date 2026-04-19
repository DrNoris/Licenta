import { useEffect } from "react";

export const useBodyScrollLock = (locked: boolean): void => {
    useEffect(() => {
        if (locked) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [locked]);
}