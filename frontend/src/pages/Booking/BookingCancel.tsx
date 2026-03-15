import {Link} from "react-router-dom";

export default function BookingCancel() {
    return (
        <div style={{ textAlign: "center", padding: "4rem" }}>
            <h1>Plată anulată</h1>
            <p>Nu ai fost taxat. Poți încerca din nou.</p>
            <Link to="/">Înapoi la hartă</Link>
        </div>
    );
}