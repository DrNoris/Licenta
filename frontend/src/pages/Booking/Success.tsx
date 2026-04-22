import {Link} from "react-router-dom";

export default function BookingSuccess() {
    return (
        <div style={{ textAlign: "center", padding: "4rem" }}>
            <h1>Rezervare confirmată! 🎉</h1>
            <p>Plata a fost procesată cu succes.</p>
            <Link to="/bookings">Vezi rezervările facute</Link>
        </div>
    );
}