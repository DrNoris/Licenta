import type {HowItWorksProps, Step} from "./HowItWorks.types.ts";
import './HowItWorks.styles.css'

const DEFAULT_STEPS: Step[] = [
    {
        title: "Căutare locuri de parcare",
        description:
            "Căută locuri de parcare disponibile în Cluj-Napoca, în funcție de timpul și locul dorit.",
    },
    {
        title: "Rezervă un loc",
        description:
            "Rezervă un loc de parcare rapid și ușor, prin aplicație. Vei plăti doar pentru timpul pe care îl folosești.",
    },
    {
        title: "Începe parcarea",
        description:
            "După confirmarea rezervării, îți vei parca vehiculul în locul respectiv. La final, plătești direct prin aplicație.",
    },
    {
        title: "Listează-ți locul în aplicație",
        description:
            "Oferă locul tău de parcare în aplicație când ești plecat și câștigă bani pasiv.",
    },
];

export default function HowItWorks({
                        heading = "Cum funcționează Park a Lot",
                        steps = DEFAULT_STEPS,
                    }: HowItWorksProps) {
    return (
        <div className="how-it-works">
            <div data-aos="fade-up" className="how-it-works__container">
                <h2 className="how-it-works__heading">{heading}</h2>
                <div className="how-it-works__grid">
                    {steps.map((step, index) => (
                        <div key={index} className="how-it-works__card">
                            <h3 className="how-it-works__card-title">{step.title}</h3>
                            <p className="how-it-works__card-text">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}