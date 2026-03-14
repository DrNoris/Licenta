import Header from "../../Components/Header/Header.tsx";
import HeroVideo from "./sections/HeroVideo/HeroVideo.tsx";
import Statistics from "./sections/Statistics/Statistics.tsx";
import HowItWorks from "./sections/HowItWorks/HowItWorks.tsx";
import CardSwitcher from "./sections/Cardswitcher/Cardswitcher.tsx";
import FAQ from "../../Components/FAQ/FAQ.tsx";
import Footer from "../../Components/Footer/Footer.tsx";

export default function Home() {
    return (
        <div>
            <Header/>
            <HeroVideo />
            <Statistics />
            <HowItWorks />
            <CardSwitcher />
            <FAQ />
            <Footer dark={true} />
        </div>
    )
}