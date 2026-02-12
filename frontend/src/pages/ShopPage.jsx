import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api';
import ProductCard from '../components/products/ProductCard';

const ShopPage = () => {
    const [searchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState('All Products');
    const [selectedPrice, setSelectedPrice] = useState('All Prices');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load from URL params
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [searchParams]);

    // Fetch Products when filters change
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            const data = await fetchProducts(selectedCategory, selectedPrice);
            setProducts(data);
            setLoading(false);
        };
        loadProducts();
    }, [selectedCategory, selectedPrice]);

    const categories = ['All Products', 'Truffles', 'Bars', 'Cookies', 'Rocca and Florentine', 'Valentines', 'Wedding'];
    const prices = ['All Prices', 'Under ₹500', '₹500 - ₹1000', 'Above ₹1000'];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h1 className="text-center" style={{ marginBottom: '2rem' }}>Our Collection</h1>

            <div className="shop-layout" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                {/* Sidebar */}
                <aside className="filters">
                    <div className="filter-group" style={{ marginBottom: '2rem' }}>
                        <h3>Categories</h3>
                        <ul className="filter-list" style={{ listStyle: 'none' }}>
                            {categories.map(cat => (
                                <li key={cat} style={{ marginBottom: '0.5rem' }}>
                                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat}
                                            onChange={() => setSelectedCategory(cat)}
                                        />
                                        {cat}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="filter-group">
                        <h3>Price Range</h3>
                        <ul className="filter-list" style={{ listStyle: 'none' }}>
                            {prices.map(price => (
                                <li key={price} style={{ marginBottom: '0.5rem' }}>
                                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="radio"
                                            name="price"
                                            checked={selectedPrice === price}
                                            onChange={() => setSelectedPrice(price)}
                                        />
                                        {price}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="products-area">
                    {loading ? (
                        <div className="text-center" style={{ padding: '3rem' }}>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}></i>
                        </div>
                    ) : (
                        <>
                            <div className="product-grid">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            {products.length === 0 && (
                                <div className="text-center" style={{ padding: '3rem' }}>
                                    <h3>No products found matching your filters.</h3>
                                    <button className="btn btn-outline" onClick={() => { setSelectedCategory('All Products'); setSelectedPrice('All Prices'); }}>Clear Filters</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
