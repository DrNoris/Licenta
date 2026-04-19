import type { FooterLink, FooterProps } from "./Footer.types.ts";
import "./Footer.styles.css";

const DEFAULT_LINKS: FooterLink[] = [
    { label: "Despre", href: "#" },
    { label: "Termeni & Condiții", href: "#" },
    { label: "Contactează-ne", href: "#" },
];

export default function Footer({ dark = false, links = DEFAULT_LINKS }: FooterProps) {
    const variant: string = dark ? "dark" : "light";
    const currentYear: number = new Date().getFullYear();

    return (
        <footer className={`footer footer--${variant}`}>
            <div className={`footer__inner footer__inner--${variant}`}>
        <span className="footer__copy">
          © {currentYear}{" "}
            <a href="https://flowbite.com/">Park a Lot™</a>
          . All Rights Reserved.
        </span>
                <ul className="footer__links">
                    {links.map((link, index) => (
                        <li key={index} className="footer__link-item">
                            <a href={link.href} className="footer__link">
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
}

