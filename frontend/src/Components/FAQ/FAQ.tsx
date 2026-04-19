import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');

  .faq-wrapper {
    min-height: 100vh;
    background-color: #1a2b4a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    font-family: 'Sora', sans-serif;
  }

  .faq-container {
    width: 100%;
    max-width: 680px;
  }

  .faq-title {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #7fa8d4;
    text-align: center;
    margin-bottom: 8px;
  }

  .faq-subtitle {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    text-align: center;
    margin-bottom: 40px;
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .faq-item {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 10px;
    overflow: hidden;
    transition: background 0.2s ease;
  }

  .faq-item.open {
    background: rgba(255, 255, 255, 0.08);
  }

  .faq-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    gap: 16px;
  }

  .faq-question {
    font-size: 15px;
    font-weight: 600;
    color: #e8f0fb;
    line-height: 1.4;
  }

  .faq-icon {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(127, 168, 212, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s ease, background 0.2s ease;
  }

  .faq-icon.open {
    transform: rotate(45deg);
    background: rgba(127, 168, 212, 0.4);
  }

  .faq-icon svg {
    width: 12px;
    height: 12px;
    stroke: #7fa8d4;
  }

  .faq-answer {
    padding: 0 24px 20px;
    font-size: 14px;
    color: #a8c0d8;
    line-height: 1.7;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const faqs = [
    {
        question: "Cum garantează Park-a-Lot siguranța locului de parcare?",
        answer: "Toți utilizatorii sunt verificați, iar rezervările sunt gestionate printr-un sistem securizat.",
    },
    {
        question: "Cum pot verifica disponibilitatea unui loc?",
        answer: "Vezi în aplicație locurile disponibile în timp real și rezervă imediat.",
    },
    {
        question: "Ce se întâmplă dacă am nevoie urgentă de locul meu închiriat?",
        answer: "Poți seta perioade în care locul tău este indisponibil sau să anulezi o rezervare cu notificare prealabilă.",
    },
    {
        question: "Pot închiria un loc de parcare pentru mai multe zile?",
        answer: "Da, poți alege să rezervi un loc pe ore, zile sau chiar săptămâni.",
    },
    {
        question: "Ce se întâmplă dacă cineva nu respectă rezervarea?",
        answer: "Avem un sistem de evaluări și penalizări pentru utilizatorii neserioși.",
    },
    {
        question: "Există oferte sau abonamente pentru utilizatorii frecvenți?",
        answer: "Da, vom introduce abonamente pentru cei care folosesc frecvent Park-a-Lot.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (i: number): void  => setOpenIndex(openIndex === i ? null : i);

    return (
        <>
            <style>{styles}</style>
            <div className="faq-wrapper">
                <div className="faq-container">
                    <p className="faq-title">Ajutor</p>
                    <h1 className="faq-subtitle">Întrebări frecvente</h1>
                    <div className="faq-list">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`faq-item ${openIndex === i ? "open" : ""}`}>
                                <button className="faq-button" onClick={() => toggle(i)}>
                                    <span className="faq-question">{faq.question}</span>
                                    <span className={`faq-icon ${openIndex === i ? "open" : ""}`}>
                    <svg viewBox="0 0 12 12" fill="none" strokeWidth="2" strokeLinecap="round">
                      <line x1="6" y1="1" x2="6" y2="11" />
                      <line x1="1" y1="6" x2="11" y2="6" />
                    </svg>
                  </span>
                                </button>
                                {openIndex === i && (
                                    <p className="faq-answer">{faq.answer}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}