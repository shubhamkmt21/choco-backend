import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        '/images/hero1.png',
        '/images/hero2.png',
        '/images/hero3.png',
        '/images/hero4.png'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <section className="hero">
            <div className="hero-slider">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide})` }}
                    ></div>
                ))}
            </div>

            <div className="hero-content">
                <h1 className="liquid-reveal">Indulge in Pure Luxury</h1>
                <p>Handcrafted premium chocolates made with the finest cocoa. The perfect gift for every occasion.</p>
                <Link to="/products" className="btn btn-primary">Shop Collection</Link>
            </div>
        </section>
    );
};

export default Hero;
