import React from 'react';

const Features = () => {
    return (
        <div className="usp-bar reveal" style={{ opacity: 1, transform: 'none' }}>
            <div className="usp-item">
                <i className="fas fa-truck-fast"></i>
                <span>Free Shipping &gt; ₹2500</span>
            </div>
            <div className="usp-item">
                <i className="fas fa-certificate"></i>
                <span>100% Handcrafted</span>
            </div>
            <div className="usp-item">
                <i className="fas fa-shield-alt"></i>
                <span>Secure Checks</span>
            </div>
            <div className="usp-item">
                <i className="fas fa-leaf"></i>
                <span>Sustainably Sourced</span>
            </div>
        </div>
    );
};

export default Features;
