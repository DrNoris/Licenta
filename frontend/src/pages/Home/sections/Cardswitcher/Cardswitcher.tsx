import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {Card, CardSwitcherProps} from "./Cardswitcher.types.ts"
import "./Cardswitcher.styles.css";

const CHECK_ICON = (
    <svg
        className="card-switcher__icon card-switcher__icon--check"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
    >
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
    </svg>
);

const CROSS_ICON = (
    <svg
        className="card-switcher__icon card-switcher__icon--cross"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
    >
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
    </svg>
);

const DEFAULT_CARDS: Card[] = [
    {
        title: "Ai un loc de parcare?",
        description:
            "Câștigă bani pasiv închiriindu-l când nu îl folosești. \nControlezi cine îl folosește și când.\nTotul este transparent și sigur prin aplicație.",
        avantaje:
            "Mi-e teamă să închiriez locul, nu știu cine îl va folosi.\nTrebuie să mă cert cu cineva pentru locul meu\nProprietatea mea nu este în siguranță",
        color: "blue",
    },
    {
        title: "Cauți un loc de parcare?",
        description:
            "Rezervi un loc rapid, fără riscul de a fi ridicată mașina.\nVezi disponibilitatea în timp real.\nAi datele proprietarului direct în aplicație.",
        avantaje:
            "Mașina mea va fi ridicată.\nÎntârzii pentru că nu găsesc parcare\nTrebuie să parchez pe trotuar sau într-un loc riscant",
        color: "white",
    },
];

function CardSwitcher({
                          cards = DEFAULT_CARDS,
                          autoPlayInterval = 5000,
                      }: CardSwitcherProps) {
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const switchCards = (direction: number): void => {
        setActiveIndex(
            (prevIndex) => (prevIndex + direction + cards.length) % cards.length
        );
    };

    useEffect(() => {
        const interval = setInterval(() => {
            switchCards(1);
        }, autoPlayInterval);
        return () => clearInterval(interval);
    }, [activeIndex, autoPlayInterval]);

    const activeCard = cards[activeIndex];

    return (
        <div className="card-switcher">
            {/* Card — only the active one is rendered, AnimatePresence handles transitions */}
            <div className="card-switcher__stage">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        className={`card-switcher__card card-switcher__card--${activeCard.color}`}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                        exit={{ opacity: 0, y: -50, transition: { duration: 0.3 } }}
                    >
                        <h5 className={`card-switcher__title card-switcher__title--${activeCard.color}`}>
                            {activeCard.title}
                        </h5>

                        <ul role="list" className="card-switcher__list">
                            {activeCard.description.split("\n").map((line, i) => (
                                <li key={`desc-${i}`} className="card-switcher__item">
                                    {CHECK_ICON}
                                    <span className="card-switcher__item-text">{line}</span>
                                </li>
                            ))}
                            {activeCard.avantaje.split("\n").map((line, i) => (
                                <li key={`avantaj-${i}`} className="card-switcher__item card-switcher__item--strikethrough">
                                    {CROSS_ICON}
                                    <span className="card-switcher__item-text">{line}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="card-switcher__controls">
                <button
                    className="card-switcher__btn"
                    onClick={() => switchCards(-1)}
                    aria-label="Previous card"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    className="card-switcher__btn"
                    onClick={() => switchCards(1)}
                    aria-label="Next card"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}

export default CardSwitcher;