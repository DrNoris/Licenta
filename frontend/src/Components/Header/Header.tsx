import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import './Header.styles.css'
import {isAuthenticated, logout} from "../../services/authService.ts";

function Header() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <header className="header">
            <div className="header__inner">

                {/* Logo */}
                <Link to="/" className="header__logo">
                    <img src="../../../public/logo.png" alt="Park a Lot Logo" className="header__logo-img" />
                </Link>

                {/* Desktop Nav */}
                <nav className="header__nav-desktop">
                    {isAuthenticated() ? (
                        <>
                            {/*<img*/}
                            {/*    className="header__icon"*/}
                            {/*    src="https://cdn-icons-png.flaticon.com/512/3119/3119338.png"*/}
                            {/*    alt="Notifications"*/}
                            {/*/>*/}
                            {/*<img*/}
                            {/*    className="header__icon"*/}
                            {/*    src="https://icons.veryicon.com/png/o/miscellaneous/basic-icon/message-54.png"*/}
                            {/*    alt="Messages"*/}
                            {/*/>*/}
                            <Link to="/find_spot">
                                <button className="btn-primary">HARTĂ</button>
                            </Link>
                            <Link to="/manage">
                                <button className="btn-outline">ÎNCHIREAZĂ</button>
                            </Link>
                                <img
                                    className="header__avatar"
                                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                    alt="User profile"
                                    onClick={() => logout()}
                                />
                        </>
                    ) : (
                        <>
                        <Link to="/login">
                                <button className="btn-primary">LOG IN</button>
                            </Link>
                            <Link to="/register">
                                <button className="btn-outline">SIGN UP</button>
                            </Link>
                        </>
                    )}
                </nav>

                {/* Burger Button */}
                <button className="header__burger" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
                    {isOpen ? <X size={30} /> : <Menu size={30} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <nav className="header__nav-mobile">
                    {isAuthenticated() ? (
                        <>

                            <Link to="/bookings" onClick={() => setIsOpen(false)}>
                                <button className="btn-primary btn-primary--wide">REZERVĂRI</button>
                            </Link>
                            {/*<button className="btn-primary btn-primary--wide">MESAJE</button>*/}
                            {/*<button className="btn-primary btn-primary--wide">CONT</button>*/}

                            <Link to="/find_spot" onClick={() => setIsOpen(false)}>
                                <button className="btn-primary btn-primary--wide">HARTĂ</button>
                            </Link>
                            <Link to="/manage" onClick={() => setIsOpen(false)}>
                                <button className="btn-outline btn-outline--wide">ÎNCHIREAZĂ</button>
                            </Link>

                            <hr className="header__divider"/>

                                <button className="btn-outline btn-outline--wide" onClick={() => {
                                    setIsOpen(false);
                                    logout();
                                }}>SIGN OUT</button>
                        </>
                    ) : (
                        <>
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                                <button className="btn-primary btn-primary--wide">LOG IN</button>
                            </Link>
                            <Link to="/register" onClick={() => setIsOpen(false)}>
                                <button className="btn-outline btn-outline--wide">SIGN UP</button>
                            </Link>
                        </>
                    )}
                </nav>
            )}
        </header>
    );
}

export default Header;