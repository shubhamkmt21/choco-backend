import axios from 'axios';

// Auto-detect backend URL (localhost or production)
const API_URL = import.meta.env.PROD
    ? 'https://choco-backend-k0jv.onrender.com/api' // Production URL
    : 'http://localhost:3000/api'; // Local Development URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchProducts = async (category, priceRange) => {
    try {
        const params = {};
        if (category && category !== 'All Products') params.category = category;
        if (priceRange && priceRange !== 'All Prices') params.priceRange = priceRange;

        const response = await api.get('/products', { params });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

export const createRazorpayOrder = async (amount) => {
    const response = await api.post('/create-razorpay-order', { amount });
    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await api.post('/verify-payment', paymentData);
    return response.data;
};

export const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

export default api;
