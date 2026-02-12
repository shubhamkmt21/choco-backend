import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Bestsellers from '../components/home/Bestsellers';

const HomePage = () => {
    return (
        <>
            <Hero />
            <Features />
            <Bestsellers />
            {/* Additional sections (Spotlight, Reviews) can be added here */}
        </>
    );
};

export default HomePage;
