
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { findProductById, PRODUCTS_DATA } from '../data';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const found = findProductById(id);
        if (found) {
            setProduct(found);
            setMainImage(found.image);
            // Scroll to top on load
            window.scrollTo(0, 0);
        }
    }, [id]);

    if (!product) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><h2>Product not found</h2><Link to="/products" className="btn btn-primary">Back to Shop</Link></div>;
    }

    // Default thumbnails if product.images is missing
    const images = product.images || [product.image];

    return (
        <div className="container product-detail-container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
            <div className="product-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                {/* Gallery */}
                <div className="gallery-section">
                    <div className="main-image-container" style={{ marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                        <img src={mainImage} alt={product.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                    <div className="thumbnails" style={{ display: 'flex', gap: '10px' }}>
                        {images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`Thumbnail ${idx} `}
                                onClick={() => setMainImage(img)}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: mainImage === img ? '2px solid var(--color-secondary)' : '1px solid #ddd'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="details-section">
                    <span className="badge" style={{ background: 'var(--color-secondary)', color: '#fff', padding: '0.3em 0.8em', borderRadius: '20px', fontSize: '0.85rem' }}>
                        {product.category}
                    </span>
                    <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>{product.name}</h1>

                    <div className="price-rating" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '1.5rem' }}>
                        <span className="current-price" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{product.price}</span>
                        <div className="rating">
                            <i className="fas fa-star" style={{ color: '#FFD700' }}></i>
                            <i className="fas fa-star" style={{ color: '#FFD700' }}></i>
                            <i className="fas fa-star" style={{ color: '#FFD700' }}></i>
                            <i className="fas fa-star" style={{ color: '#FFD700' }}></i>
                            <i className="fas fa-star-half-alt" style={{ color: '#FFD700' }}></i>
                            <span style={{ marginLeft: '5px', color: '#666' }}>(4.8)</span>
                        </div>
                    </div>

                    <p className="description" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555', marginBottom: '2rem' }}>
                        {product.description}
                    </p>

                    <div className="ingredients-box" style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}><i className="fas fa-leaf" style={{ color: 'var(--color-secondary)' }}></i> Ingredients</h4>
                        <p style={{ fontSize: '0.95rem', color: '#666' }}>{product.ingredients || "Premium Cocoa, Milk Solids, Cocoa Butter, Sugar."}</p>
                    </div>

                    <div className="actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="qty-selector" style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
                            <span style={{ padding: '0 15px', fontWeight: 'bold' }}>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
                        </div>
                        <button className="btn btn-primary" onClick={() => addToCart(product, quantity)} style={{ flex: 1, padding: '12px' }}>
                            Add to Cart - ₹{product.price * quantity}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
