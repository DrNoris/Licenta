import { useState } from "react";
import Header from "../../../Components/Header/Header.tsx";
import type {BookingTab} from "./BookingsPage.types.ts";
import "./BookingsPage.styles.css"
import BookingsList from "../../../Components/BookingsList/BookingsList.tsx";

function BookingsPage() {
    const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");

    return (
        <div className="bookings-page">
            <Header />
            <div className="bookings-page__container">

                <h1 className="bookings-page__title">Rezervările mele</h1>
                <p className="bookings-page__subtitle">
                    Gestionează rezervările tale active și viitoare
                </p>

                {/* Tabs */}
                <div className="bookings-page__tabs">
                    <button
                        className={`bookings-page__tab ${activeTab === "upcoming" ? "bookings-page__tab--active" : ""}`}
                        onClick={() => setActiveTab("upcoming")}
                    >
                        Viitoare
                    </button>
                    <button
                        className={`bookings-page__tab ${activeTab === "archive" ? "bookings-page__tab--active" : ""}`}
                        onClick={() => setActiveTab("archive")}
                    >
                        Arhivă
                    </button>
                </div>

                {/* Content — swaps based on active tab */}
                <BookingsList tab={activeTab} />

            </div>
        </div>
    );
}

export default BookingsPage;