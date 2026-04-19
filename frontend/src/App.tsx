import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./pages/Home/Home.tsx";
import Login from "./pages/Login/Login.tsx";
import AuthGuard from "./Components/AuthGuard/AuthGuard.tsx";
import Register from "./pages/Register/Register.tsx";
import Activate from "./pages/Activate/Activate.tsx";
import ManageParkingSpots from "./pages/ManageParkingSpots/ManageParkingSpots.tsx";
import FindSpot from "./pages/FindSpot/FindSpot.tsx";
import BookingSuccess from "./pages/Booking/Success.tsx";
import BookingCancel from "./pages/Booking/BookingCancel.tsx";
import BookingsPage from "./pages/Booking/BookingsPage/BookingsPage.tsx";
import ChatPage from "./pages/Chat/ChatPage.tsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/verify" element={<Activate/>}/>
                <Route path="/manage" element={<AuthGuard><ManageParkingSpots/></AuthGuard>}/>
                <Route path="/find_spot" element={<FindSpot/>}/>
                <Route path="/booking/success" element={<AuthGuard><BookingSuccess/></AuthGuard>}/>
                <Route path="/booking/cancel" element={<AuthGuard><BookingCancel/></AuthGuard>}/>
                <Route path="/bookings" element={<AuthGuard><BookingsPage /></AuthGuard>} />
                <Route path="/chat" element={<AuthGuard><ChatPage /></AuthGuard>} />
                <Route path="/chat/:conversationId" element={<AuthGuard><ChatPage /></AuthGuard>} />
            </Routes>
        </BrowserRouter>
    )
}