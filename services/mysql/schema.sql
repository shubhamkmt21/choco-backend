-- Database Schema for Chocolate Ecommerce (MySQL)

-- Users Table (Managed by PHP Auth Service)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table (Managed by Node.js Core Service)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    stock INT DEFAULT 100
);

-- Orders Table (Managed by Node.js Core Service)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    total_amount DECIMAL(10, 2),
    items JSON, -- Stores array of items
    payment_status ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Table (Managed by Django Analytics Service)
CREATE TABLE IF NOT EXISTS analytics_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- e.g., 'page_view', 'add_to_cart'
    page_url VARCHAR(255),
    user_id INT, -- Optional, if logged in
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
