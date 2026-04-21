import type {HeroVideoProps} from "./HeroVideo.types.ts";
import './HeroVideo.styles.css'
export default function HeroVideo({
                       backgroundSrc = "0319.gif",
                       title = "Bine ați venit la Park a Lot",
                       subtitle = "Cel mai tare din parcare - Prima aplicație de park sharing peer to peer",
                       ctaLabel = "Hai să pornim!",
                       ctaHref = "/find_spot",
                   }: HeroVideoProps) {
    return (
        <div className="hero">
            {/* Background */}
            <div className="hero__background">
                <img src={backgroundSrc} alt="Background" className="hero__bg-image" />
                <div className="hero__overlay" />
            </div>

            {/* Content */}
            <div data-aos="fade-up" className="hero__content">
                <h1 className="hero__title">{title}</h1>
                <p className="hero__subtitle">{subtitle}</p>
                <a href={ctaHref} className="hero__cta">
                    {ctaLabel}
                </a>
            </div>
        </div>
    );
}