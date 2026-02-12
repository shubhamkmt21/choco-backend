import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <img src="/images/logo.png" alt="Choco Blossom" style={{ width: '140px', marginBottom: '1rem', borderRadius: '8px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Crafting memories with premium chocolates. Based in Ahmedabad, delivering happiness nationwide.</p>
                        <div className="social-links">
                            <a href="https://www.facebook.com/chocoblossomIndia/" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                            <a href="https://www.instagram.com/chocoblossomindia/" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-instagram"></i></a>
                            <a href="https://www.youtube.com/@Choco-blossom" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-youtube"></i></a>
                            <a href="https://www.linkedin.com/company/chocoblossom/" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">Shop All</Link></li>
                            <li><Link to="/about">Our Story</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Customer Care</h4>
                        <ul className="footer-links">
                            <li><Link to="/shipping">Shipping Policy</Link></li>
                            <li><Link to="/returns">Returns & Refunds</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><a href="https://www.shiprocket.in/shipment-tracking/" target="_blank" rel="noreferrer">Track Order</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Contact Us</h4>
                        <ul className="footer-links">
                            <li style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', gap: '10px' }}>
                                <i className="fas fa-map-marker-alt" style={{ marginTop: '5px' }}></i>
                                <a href="https://maps.app.goo.gl/Jihe6SA3eRXgMHd29" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    <span>28, Saurasthra Society, Paldi, Ahmedabad, Gujarat 380007</span>
                                </a>
                            </li>
                            <li style={{ color: 'rgba(255,255,255,0.8)' }}>
                                <a href="tel:+919227088688" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    <i className="fas fa-phone" style={{ width: '20px' }}></i> +91 92270 88688
                                </a>
                            </li>
                            <li style={{ color: 'rgba(255,255,255,0.8)' }}>
                                <a href="mailto:chocoblossom12@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    <i className="fas fa-envelope" style={{ width: '20px' }}></i> chocoblossom12@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div style={{ textAlign: 'center' }}>
                        <p>&copy; 2026 Choco Blossom. All rights reserved.</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>Based in Ahmedabad, Gujarat</p>
                    </div>
                    <div className="payment-icons">
                        <i className="fab fa-google-pay"></i>
                        <i className="fab fa-cc-visa"></i>
                        <i className="fab fa-cc-amex"></i>
                        <i className="fab fa-cc-mastercard"></i>
                        <i className="fab fa-cc-paypal"></i>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
