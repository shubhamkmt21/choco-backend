import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="product-card">
            <div className="product-image">
                {/* Badge logic can be passed as prop later if needed */}
                <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} />
                </Link>
                <button className="wishlist-btn"><i className="far fa-heart"></i></button>
            </div>
            <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-title">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>
                <div className="rating">
                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
                    <span>(4.8)</span>
                </div>
                <div className="product-footer">
                    <span className="price">₹{product.price}</span>
                    <button className="add-cart-btn" onClick={() => addToCart(product)}>
                        Add <i className="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
