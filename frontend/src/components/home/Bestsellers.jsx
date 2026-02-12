import React from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS_DATA } from '../../data';
import ProductCard from '../products/ProductCard';

const Bestsellers = () => {
    // Select specific bestsellers or top 4
    const bestsellers = PRODUCTS_DATA.filter(p => [110, 12, 1, 3].includes(p.id));

    return (
        <section className="section" style={{ backgroundColor: '#fff' }}>
            <div className="container">
                <h2 className="text-center liquid-reveal">Bestsellers</h2>
                <div className="text-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/1047/1047711.png" width="40" style={{ margin: '0 auto 2rem', opacity: 0.5 }} alt="divider" />
                </div>

                <div className="product-grid">
                    {bestsellers.map(product => (
                        <div key={product.id} className="reveal">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                <div className="text-center" style={{ marginTop: '3rem' }}>
                    <Link to="/products" className="btn btn-outline">View All Products</Link>
                </div>
            </div>
        </section>
    );
};

export default Bestsellers;
