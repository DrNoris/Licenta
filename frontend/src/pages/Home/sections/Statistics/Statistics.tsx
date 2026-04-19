import { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import type {Statistic, StatisticsProps} from "./Statistics.types.ts";
import './Statistics.styles.css'
import type {LegacyAnimationControls} from "motion";

const DEFAULT_STATISTICS: Statistic[] = [
    {
        procentage: 89,
        text: "Dintre șoferi au dificultăți în găsirea unui loc de parcare.",
    },
    {
        procentage: 91,
        text: "Dintre șoferi ar plăti pentru un loc garantat și sigur.",
    },
];

const RADIUS: number = 40;
const STROKE_WIDTH: number = 10;
const CIRCUMFERENCE: number = 2 * Math.PI * RADIUS;

export default function Statistics({ statistics = DEFAULT_STATISTICS }: StatisticsProps) {
    const ref: React.RefObject<HTMLDivElement | null > = useRef<HTMLDivElement>(null);
    const controls: LegacyAnimationControls = useAnimation();
    const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
    const [animatedValues, setAnimatedValues] = useState<number[]>(
        statistics.map(() => 0)
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisibleIndex(1);
                }
            },
            { threshold: 0.5 }
        );

        const current = ref.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, []);

    useEffect(() => {
        if (visibleIndex === null) return;

        statistics.forEach((stat, index) => {
            controls.start({
                strokeDashoffset: CIRCUMFERENCE - (CIRCUMFERENCE * stat.procentage) / 100,
                transition: { duration: 1.5, ease: "easeOut" },
            });

            let currentPercentage = 0;
            const interval = setInterval(() => {
                currentPercentage += 1;
                if (currentPercentage > stat.procentage) {
                    clearInterval(interval);
                } else {
                    setAnimatedValues((prev) => {
                        const next = [...prev];
                        next[index] = currentPercentage;
                        return next;
                    });
                }
            }, 15);
        });
    }, [visibleIndex]);

    return (
        <div ref={ref} className="statistics">
            {statistics.map((value, index) => (
                <div data-aos="fade-up" key={index} className="statistics__item">
                    <svg className="statistics__svg" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            className="statistics__circle-bg"
                            strokeWidth={STROKE_WIDTH}
                            cx="50"
                            cy="50"
                            r={RADIUS}
                            fill="transparent"
                        />

                        {/* Animated progress circle */}
                        <motion.circle
                            className="statistics__circle-progress"
                            strokeWidth={STROKE_WIDTH}
                            strokeLinecap="round"
                            cx="50"
                            cy="50"
                            r={RADIUS}
                            fill="transparent"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={CIRCUMFERENCE}
                            transform="rotate(-90 50 50)"
                            animate={controls}
                        />

                        {/* Percentage label */}
                        <text
                            x="50"
                            y="50"
                            className="statistics__percentage-text"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {animatedValues[index]}%
                        </text>
                    </svg>

                    <p className="statistics__label">{value.text}</p>
                </div>
            ))}
        </div>
    );
}