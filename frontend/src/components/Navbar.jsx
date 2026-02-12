import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartCount } = useCart();

    return (
        <header>
            <div className="container navbar">
                <div className="logo">
                    <Link to="/">
                        <img src="/images/logo.png" alt="Choco Blossom Logo" />
                    </Link>
                </div>

                <nav className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="active" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>Our Story</Link>
                    <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>

                    <div className="dropdown mega-dropdown">
                        <Link to="/products" className="dropbtn">Occasions <i className="fas fa-chevron-down" style={{ marginLeft: '6px', fontSize: '0.7em' }}></i></Link>
                        <div className="mega-content">
                            <div className="mega-grid">
                                <div className="mega-column">
                                    <h4>Celebrations</h4>
                                    <ul>
                                        <li><Link to="/products?category=Birthday">Birthday Gifts</Link></li>
                                        <li><Link to="/products?category=Wedding">Wedding Gifts</Link></li>
                                        <li><Link to="/products?category=Anniversary">Anniversary</Link></li>
                                        <li><Link to="/products?category=Baby+Shower">Baby Shower</Link></li>
                                        <li><Link to="/products?category=Baby+Announcement">Baby Announcement</Link></li>
                                        <li><Link to="/products?category=House+Warming">House Warming</Link></li>
                                    </ul>
                                </div>
                                <div className="mega-column">
                                    <h4>Festivals</h4>
                                    <ul>
                                        <li><Link to="/products?category=Diwali">Diwali Gifts</Link></li>
                                        <li><Link to="/products?category=Rakhi">Rakhi Gifts</Link></li>
                                        <li><Link to="/products?category=Christmas">Christmas & New Year</Link></li>
                                        <li><Link to="/products?category=Holi">Holi Gifts</Link></li>
                                        <li><Link to="/products?category=Ramadan">Ramadan Gifts</Link></li>
                                        <li><Link to="/products?category=Bhai+Dooj">Bhai Dooj</Link></li>
                                    </ul>
                                </div>
                                <div className="mega-column">
                                    <h4>Special Days</h4>
                                    <ul>
                                        <li><Link to="/products?category=Valentines">Valentine’s Day</Link></li>
                                        <li><Link to="/products?category=Mothers+Day">Mother’s Day</Link></li>
                                        <li><Link to="/products?category=Fathers+Day">Father’s Day</Link></li>
                                        <li><Link to="/products?category=Womens+Day">Women’s Day</Link></li>
                                        <li><Link to="/products?category=Kids">Kid's Gifts</Link></li>
                                    </ul>
                                </div>
                                <div className="mega-column">
                                    <h4>Collections</h4>
                                    <ul>
                                        <li><Link to="/products?category=Bestsellers">Best Sellers</Link></li>
                                        <li><Link to="/products?category=Corporate">Corporate Gifts</Link></li>
                                        <li><Link to="/products?category=Dark">Dark Chocolates</Link></li>
                                        <li><Link to="/products?category=Pick+Mix">Pick & Mix Gifts</Link></li>
                                        <li><Link to="/products?category=Studio">Studio Creations</Link></li>
                                        <li><Link to="/gift-cards">Gift Cards</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link to="/corporate" onClick={() => setIsMobileMenuOpen(false)}>Corporate Gifting</Link>
                    <Link to="/wedding" onClick={() => setIsMobileMenuOpen(false)}>Wedding Gifts</Link>
                    <Link to="/partners" onClick={() => setIsMobileMenuOpen(false)}>Growth Partner</Link>
                    <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
                </nav>

                <div className="nav-icons">
                    <div className="search-container">
                        <input type="text" id="search-input" placeholder="Search..." />
                        <button className="search-btn" id="search-toggle"><i className="fas fa-search"></i></button>
                    </div>
                    <Link to="/cart" className="cart-icon" id="cart-btn">
                        <i className="fas fa-shopping-bag"></i>
                        <span id="cart-count">({cartCount})</span>
                    </Link>
                    <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
