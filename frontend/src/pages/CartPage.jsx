import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <i className="fas fa-shopping-bag" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }}></i>
                <h2>Your cart is empty</h2>
                <p style={{ margin: '1rem 0 2rem' }}>Looks like you haven't added any chocolates yet.</p>
                <Link to="/products" className="btn btn-primary">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
            <h1 className="text-center" style={{ marginBottom: '2rem' }}>Your Shopping Cart</h1>

            <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Cart Items */}
                <div className="cart-items">
                    <div className="cart-header" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 0.5fr', padding: '1rem', borderBottom: '2px solid #eee', fontWeight: 'bold' }}>
                        <span>Product</span>
                        <span>Price</span>
                        <span>Quantity</span>
                        <span></span>
                    </div>
                    {cart.map(item => (
                        <div key={item.id} className="cart-item" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 0.5fr', padding: '1.5rem 1rem', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div>
                                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{item.category}</span>
                                </div>
                            </div>
                            <div style={{ fontWeight: 'bold' }}>₹{item.price}</div>
                            <div className="qty-selector" style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', width: 'fit-content' }}>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
                                <span style={{ padding: '0 10px' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    ))}
                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                        <button onClick={clearCart} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear Cart</button>
                    </div>
                </div>

                {/* Summary */}
                <div className="cart-summary" style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Order Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span>Subtotal</span>
                        <span>₹{cartTotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span>Shipping</span>
                        <span>{cartTotal > 2500 ? 'Free' : 'Calculated at checkout'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '2px solid #ddd', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span>₹{cartTotal}</span>
                    </div>
                    <Link to="/checkout" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', width: '100%' }}>
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
