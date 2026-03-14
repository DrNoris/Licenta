export interface Card {
    title: string;
    description: string;
    avantaje: string;
    color: "blue" | "white";
}

export interface CardSwitcherProps {
    cards?: Card[];
    autoPlayInterval?: number;
}