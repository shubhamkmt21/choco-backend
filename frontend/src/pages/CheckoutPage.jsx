import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createRazorpayOrder, verifyPayment, createOrder } from '../api';

const CheckoutPage = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        state: ''
    });

    if (cart.length === 0) {
        return <div className="p-10 text-center"><h2>Cart is empty</h2></div>;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Order on Backend (Razorpay)
            const orderData = await createRazorpayOrder(cartTotal);

            if (!orderData || !orderData.id) {
                alert('Failed to create order. Please try again.');
                setLoading(false);
                return;
            }

            // 2. Open Razorpay Options
            const options = {
                key: "rzp_live_Qg11jTM5s0KRbh", // Public Key
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Choco Blossom",
                description: "Premium Chocolates",
                image: "/images/logo.png",
                order_id: orderData.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.status === 'success') {
                            // 4. Save Order to Database
                            await createOrder({
                                customer_name: formData.name,
                                customer_email: formData.email,
                                customer_phone: formData.phone,
                                shipping_address: {
                                    line1: formData.address,
                                    city: formData.city,
                                    state: formData.state,
                                    pincode: formData.pincode
                                },
                                total_amount: cartTotal,
                                items: cart,
                                payment_status: 'Paid',
                                transaction_id: response.razorpay_payment_id,
                                payment_method: 'Razorpay'
                            });

                            clearCart();
                            alert('Order Placed Successfully! We will contact you shortly.');
                            navigate('/');
                        } else {
                            alert('Payment Verification Failed');
                        }
                    } catch (err) {
                        console.error('Verification Error', err);
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: "#3E2723"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error('Payment Error', error);
            alert('Something went wrong. Please check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
            <h1 className="text-center" style={{ marginBottom: '2rem' }}>Checkout</h1>

            <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                {/* Form */}
                <div className="shipping-form">
                    <h3>Shipping Details</h3>
                    <form onSubmit={handlePayment} style={{ display: 'grid', gap: '15px', marginTop: '1rem' }}>
                        <input type="text" name="name" placeholder="Full Name" required className="form-input" onChange={handleChange} />
                        <input type="email" name="email" placeholder="Email Address" required className="form-input" onChange={handleChange} />
                        <input type="tel" name="phone" placeholder="Phone Number" required className="form-input" onChange={handleChange} />
                        <textarea name="address" placeholder="Shipping Address" required className="form-input" rows="3" onChange={handleChange}></textarea>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <input type="text" name="city" placeholder="City" required className="form-input" onChange={handleChange} />
                            <input type="text" name="state" placeholder="State" required className="form-input" onChange={handleChange} />
                            <input type="text" name="pincode" placeholder="Pincode" required className="form-input" onChange={handleChange} />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : `Pay ₹${cartTotal}`}
                        </button>
                    </form>
                </div>

                {/* Summary */}
                <div className="order-summary" style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
                    <h3>Order Summary</h3>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                        {cart.map(item => (
                            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                    <div style={{ borderTop: '1px solid #ddd', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span>₹{cartTotal}</span>
                    </div>
                </div>
            </div>

            <style>{`
                .form-input {
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export default CheckoutPage;
