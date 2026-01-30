// --- CONFIGURATION ---
// AFTER DEPLOYING TO RENDER, PASTE YOUR URL HERE:
const PRODUCTION_API_URL = "https://choco-backend-k0jv.onrender.com/api";

// API Base URL - Auto-detects environment
const API_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? (window.location.port === '3000' ? '/api' : 'http://localhost:3000/api')
    : PRODUCTION_API_URL;

// --- WhatsApp Floating Button Injection ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if button already exists to prevent duplicates
    if (!document.querySelector('.whatsapp-float')) {
        const waButton = document.createElement('a');
        waButton.href = 'https://wa.me/919227088688?text=Hello%20Choco%20Blossom,%20I%20would%20like%20to%20know%20more%20about%20your%20products!';
        waButton.className = 'whatsapp-float';
        waButton.target = '_blank';
        waButton.innerHTML = '<i class="fab fa-whatsapp"></i>';
        document.body.appendChild(waButton);

        // Add Message Bubble
        const waMsg = document.createElement('div');
        waMsg.className = 'whatsapp-msg';
        waMsg.innerText = 'How may I help you?';
        document.body.appendChild(waMsg);
    }
    // --- Search Bar Logic ---
    const searchToggle = document.getElementById('search-toggle');
    const searchInput = document.getElementById('search-input');
    const searchContainer = document.querySelector('.search-container');

    if (searchToggle && searchInput && searchContainer) {
        searchToggle.addEventListener('click', (e) => {
            e.preventDefault();
            if (searchContainer.classList.contains('active') && searchInput.value.trim() !== '') {
                // Perform Search
                handleSearch(searchInput.value.trim());
            } else {
                searchContainer.classList.toggle('active');
                if (searchContainer.classList.contains('active')) {
                    searchInput.focus();
                }
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(searchInput.value.trim());
            }
        });
    }
});

function handleSearch(query) {
    if (!query) return;
    // Redirect to products.html with search query
    // Preserve existing category if possible, or reset? Resetting is safer for "global search"
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
}


// --- Cart Management ---
function getCart() {
    return JSON.parse(localStorage.getItem('chocoCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('chocoCart', JSON.stringify(cart));
    updateCartMetadata(); // Updates header count
}

// Make globally available for React/Vue
window.getCart = getCart;
window.saveCart = saveCart;

window.addToCart = function (product) {
    console.log("Adding to cart:", product); // Debug log
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);

    // Feedback
    showToast(`${product.name} added to cart!`);
    // Optional: trigger a custom event
    window.dispatchEvent(new Event('cartUpdated'));
};

function showToast(message) {
    let toast = document.getElementById('choco-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'choco-toast';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fas fa-check-circle" style="color: #4CAF50;"></i> ${message}`;

    // Reset animation if already showing
    toast.classList.remove('show');
    void toast.offsetWidth; // Trigger reflow

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

window.removeFromCart = function (id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    if (typeof renderCart === 'function') renderCart();
};

window.updateQuantity = function (id, change) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            window.removeFromCart(id);
            return;
        }
    }

    saveCart(cart);
    if (typeof renderCart === 'function') renderCart();
};

function updateCartMetadata() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = `(${count})`;
}
window.updateCartMetadata = updateCartMetadata; // Export

// --- Product Page Logic ---
async function fetchProducts() {
    const container = document.getElementById('products-list');
    const countLabel = document.getElementById('product-count');
    if (!container) return;

    // Get active filters
    const activeCategory = document.querySelector('#category-filters li.active')?.dataset.value || 'All Products';
    const activePrice = document.querySelector('#price-filters li.active')?.dataset.value || '';

    let url = `${API_URL}/products?category=${encodeURIComponent(activeCategory)}`;
    if (activePrice) {
        url += `&priceRange=${encodeURIComponent(activePrice)}`;
    }

    try {
        const response = await fetch(url);
        const json = await response.json();
        const products = json.data;

        countLabel.textContent = `Showing ${products.length} products`;
        container.innerHTML = '';

        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <a href="product_detail.html?id=${p.id}" style="text-decoration: none; color: inherit; display: block;">
                    <div class="product-image">
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <div class="product-info">
                        <div class="product-category">${p.category}</div>
                        <h3 class="product-title">${p.name}</h3>
                        <div class="product-price">₹${p.price}</div>
                    </div>
                </a>
                <div style="padding: 0 1.5rem 1.5rem;">
                     <button class="add-btn" onclick='event.stopPropagation(); addToCart(${JSON.stringify(p)})'>Add to Cart</button>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        container.innerHTML = '<p class="text-center">Failed to load products. Is the server running?</p>';
    }
}

// --- Homepage Bestsellers Logic ---
async function fetchBestsellers() {
    const container = document.getElementById('bestseller-grid');
    if (!container) return;

    try {
        // Fetch all products, slicing the first 4 for bestsellers
        // In a real app, you might have a specific endpoint or flag
        const response = await fetch(`${API_URL}/products`);
        const json = await response.json();
        const allProducts = json.data;

        // Curate Bestsellers: Prioritize 'Chocoblossom Special' or 'Truffles'
        let bestsellers = allProducts.filter(p => p.category === 'Chocoblossom Special');

        // If not enough specials, fill with Truffles or others
        if (bestsellers.length < 4) {
            const truffles = allProducts.filter(p => p.category === 'Truffles');
            bestsellers = [...bestsellers, ...truffles];
        }

        // Final fallback to just taking the first few if still empty
        if (bestsellers.length === 0) {
            bestsellers = allProducts;
        }

        // Limit to 4 to fit the grid
        const products = bestsellers.slice(0, 4);

        container.innerHTML = '';

        products.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = 'product-card reveal';
            // Add staggered delay
            card.style.transitionDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <a href="product_detail.html?id=${p.id}" style="text-decoration: none; color: inherit; display: block;">
                    <div class="product-image">
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <div class="product-info">
                        <div class="product-category">${p.category}</div>
                        <h3 class="product-title">${p.name}</h3>
                        <div class="product-price">₹${p.price}</div>
                    </div>
                </a>
                <div style="padding: 0 1.5rem 1.5rem;">
                     <button class="add-btn" onclick='event.stopPropagation(); addToCart(${JSON.stringify(p)})'>Add to Cart</button>
                </div>
            `;
            container.appendChild(card);
        });

        // Re-trigger observer for new elements
        if (typeof observer !== 'undefined') {
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        } else {
            // Fallback if observer isn't global yet (handled in init)
            setTimeout(() => {
                document.querySelectorAll('#bestseller-grid .reveal').forEach(el => el.classList.add('active'));
            }, 100);
        }

    } catch (error) {
        console.error('Error fetching bestsellers (Using Fallback):', error);

        // FALLBACK DATA: Ensure Bestsellers ALWAYS show Premium items even if offline
        const FALLBACK_BESTSELLERS = [
            { id: 13, name: "English Brittle", category: "Chocoblossom Special", price: 650, image: "images/english_brittle.jpg" },
            { id: 14, name: "Chocolate Thins In Milk", category: "Chocoblossom Special", price: 550, image: "images/thins_milk.jpg" },
            { id: 17, name: "Almond Roca", category: "Chocoblossom Special", price: 750, image: "images/almond_roca.jpg" },
            { id: 12, name: "Pistachio Kunafa Bar", category: "Bars", price: 750, image: "images/bar_kunafa.jpg" }
        ];

        container.innerHTML = '';
        FALLBACK_BESTSELLERS.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = 'product-card reveal';
            card.style.transitionDelay = `${index * 0.1}s`;
            card.innerHTML = `
                 <a href="product_detail.html?id=${p.id}" style="text-decoration: none; color: inherit; display: block;">
                     <div class="product-image">
                         <img src="${p.image}" alt="${p.name}" onError="this.src='https://placehold.co/600x600/3E2723/FFF?text=Choco+Delight'">
                     </div>
                     <div class="product-info">
                         <div class="product-category">${p.category}</div>
                         <h3 class="product-title">${p.name}</h3>
                         <div class="product-price">₹${p.price}</div>
                     </div>
                 </a>
                 <div style="padding: 0 1.5rem 1.5rem;">
                      <button class="add-btn" onclick='event.stopPropagation(); addToCart(${JSON.stringify(p)})'>Add to Cart</button>
                 </div>
             `;
            container.appendChild(card);
        });

        // Trigger generic reveal
        setTimeout(() => {
            document.querySelectorAll('#bestseller-grid .reveal').forEach(el => el.classList.add('active'));
        }, 100);
    }
}

// Setup Filters
const filterItems = document.querySelectorAll('.filter-list li');
filterItems.forEach(item => {
    item.addEventListener('click', function () {
        // Toggle active class within the same group
        const siblings = this.parentElement.children;
        Array.from(siblings).forEach(sib => sib.classList.remove('active'));
        this.classList.add('active');
        fetchProducts();
    });
});


// --- Cart Page Logic ---
let currentShipping = 0;

function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    const cart = getCart();
    const subtotalEl = document.getElementById('subtotal');

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 2rem;">Your cart is empty.</p>';
        subtotalEl.textContent = '₹0';
        updateTotals(0);
        return;
    }

    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <div style="display: flex; justify-content: space-between;">
                    <h4 class="item-title">${item.name}</h4>
                    <div class="remove-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i> Remove</div>
                </div>
                <div class="item-price">₹${item.price}</div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    subtotalEl.textContent = `₹${subtotal}`;

    // Auto-calculate shipping if pincode already entered or handle free tier
    checkShippingRules(subtotal);
}

function updateTotals(subtotal) {
    const totalEl = document.getElementById('total');
    const shippingEl = document.getElementById('shipping');

    if (currentShipping === 0) {
        shippingEl.textContent = "Free";
        shippingEl.style.color = "green";
    } else {
        shippingEl.textContent = `₹${currentShipping}`;
        shippingEl.style.color = "var(--color-text-main)";
    }

    totalEl.textContent = `₹${subtotal + currentShipping}`;
}

function checkShippingRules(subtotal) {
    // If order > 2500, Free Shipping always
    if (subtotal > 2500) {
        currentShipping = 0;
        updateTotals(subtotal);
        const msg = document.getElementById('delivery-msg');
        if (msg) {
            msg.innerHTML = `<i class="fas fa-gift" style="color: var(--color-accent);"></i> <strong>Free Shipping Applied!</strong> (Order > ₹2500)`;
            msg.style.color = "green";
        }
    } else {
        // If pincode was already entered, re-verify. Else wait for user input.
        const msg = document.getElementById('delivery-msg');
        if (!msg || msg.textContent === "") {
            currentShipping = 0; // Default until checked
            updateTotals(subtotal);
            if (msg) msg.textContent = "Enter Pincode to calculate shipping.";
        } else {
            // Re-trigger check if we have a valid pincode
            checkDelivery();
        }
    }
}

const RAZORPAY_KEY_ID = "rzp_live_Qg11jTM5s0KRbh"; // Public Key

async function placeOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    const name = document.getElementById('cust-name').value;
    const email = document.getElementById('cust-email').value;
    const phone = document.getElementById('cust-phone')?.value || "9999999999";
    const msg = document.getElementById('checkout-msg');

    if (!name || !email) {
        alert("Please fill in your details.");
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + currentShipping;

    msg.textContent = "Processing payment...";
    msg.style.color = 'blue';

    try {
        // 1. Convert to integer format for Razorpay (in paise)
        const amount = Math.round(total);

        // 2. Create Order on Server

        // Show "Waking up server" message if it takes time (Render Free Tier)
        const wakeUpTimer = setTimeout(() => {
            msg.textContent = "Waking up server (this may take 30s)...";
            msg.style.color = 'orange';
        }, 2500);

        const orderRes = await fetch(`${API_URL}/create-razorpay-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount, currency: "INR" })
        });

        clearTimeout(wakeUpTimer); // Clear message if fast

        const orderData = await orderRes.json();

        if (orderData.error) {
            console.error("Razorpay Order Error:", orderData.error);
            // Fallback for demo if server fails
            alert("Payment gateway error. Proceeding with COD/Standard for testing.");
            // ... (original fallback logic could go here)
            return;
        }

        // 3. Open Razorpay Checkout
        const options = {
            "key": RAZORPAY_KEY_ID,
            "amount": orderData.amount,
            "currency": orderData.currency,
            "name": "Choco Blossom",
            "description": "Chocolate Order",
            "image": "logo.png",
            "order_id": orderData.id,
            "handler": async function (response) {
                // Payment Success!
                console.log("Payment Successful!", response);
                msg.textContent = "Payment successful! Verifying...";

                // 4. Verify Payment on Server
                const verifyRes = await fetch(`${API_URL}/verify-payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(response)
                });

                const verifyData = await verifyRes.json();

                if (verifyData.status === 'success') {
                    // 5. Save Order to Database
                    const finalOrder = {
                        customer_name: name,
                        customer_email: email,
                        shipping_address: {
                            street: "Razorpay Checkout",
                            city: "India",
                            pincode: document.getElementById('pincode-input')?.value || "000000",
                            state: "NA"
                        },
                        total_amount: total,
                        items: cart,
                        payment_method: "Razorpay",
                        payment_status: "Paid",
                        transaction_id: response.razorpay_payment_id
                    };

                    await saveOrderToDB(finalOrder, msg);
                } else {
                    alert("Payment Verification Failed!");
                    msg.textContent = "Payment verification failed.";
                    msg.style.color = 'red';
                }
            },
            "prefill": {
                "name": name,
                "email": email,
                "contact": phone
            },
            "theme": {
                "color": "#5D4037"
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            console.warn("Payment Failed:", response.error);

            if (response.error.description.includes("cancelled")) {
                msg.textContent = "Payment was cancelled. You can retry.";
                msg.style.color = 'orange';
            } else if (response.error.description.includes("3dsecure")) {
                msg.textContent = "Card Error: 3D Secure not enabled. Please try a different card or UPI.";
                msg.style.color = 'red';
            } else {
                msg.textContent = "Payment Failed: " + response.error.description;
                msg.style.color = 'red';
            }
        });
        rzp1.open();

    } catch (err) {
        console.error(err);
        msg.textContent = 'Payment Error: ' + (err.message || 'Connection failed');
        msg.style.color = 'red';
    }
}

async function saveOrderToDB(orderData, msg) {
    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const result = await res.json();

        if (result.message === 'success') {
            msg.textContent = `Order placed successfully! Order ID: ${result.orderId}`;
            msg.style.color = 'green';
            localStorage.removeItem('chocoCart');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            msg.textContent = 'Order saved but DB reported error.';
            msg.style.color = 'orange';
        }
    } catch (e) {
        console.error("Save Order Error", e);
    }
}

// --- Pincode Logic ---
function checkDelivery() {
    const input = document.getElementById('pincode-input');
    const msg = document.getElementById('delivery-msg');
    const pincode = input.value.trim();

    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Rule: Free Shipping > 2500
    if (subtotal > 2500) {
        currentShipping = 0;
        updateTotals(subtotal);
        msg.innerHTML = `<i class="fas fa-gift" style="color: var(--color-accent);"></i> <strong>Free Shipping Applied!</strong> (Order > ₹2500)`;
        msg.style.color = "green";
        return;
    }

    if (!/^\d{6}$/.test(pincode)) {
        msg.textContent = 'Please enter a valid 6-digit pincode.';
        msg.style.color = 'red';
        return;
    }

    msg.textContent = 'Checking availability...';
    msg.style.color = 'var(--color-primary)';

    // Mock Shiprocket Response
    setTimeout(() => {
        let days;
        let partner = "Shiprocket";

        if (pincode.startsWith('400')) {
            days = "1-2 Business Days";
            msg.style.color = 'green';
            currentShipping = 50; // Mumbai Charge
        } else {
            days = "3-5 Business Days";
            msg.style.color = 'var(--color-text-main)';
            currentShipping = 100; // National Charge
        }

        updateTotals(subtotal);
        msg.innerHTML = `<i class="fas fa-shipping-fast" style="color: var(--color-secondary);"></i> <strong>${days}</strong><br>Fulfilled by ${partner} (Charge: ₹${currentShipping})`;
    }, 500);
}


// --- Global Init ---
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu logic (retained)
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    updateCartMetadata();

    // Fetch Data
    fetchProducts();    // For Products page
    fetchBestsellers(); // For Home page

    // Pincode Listener
    const pinBtn = document.getElementById('check-pincode-btn');
    if (pinBtn) {
        pinBtn.addEventListener('click', checkDelivery);
    }

    // --- NEW ANIMATION LOGIC ---

    // 1. Navbar Glassmorphism on Scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('glass-nav');
        } else {
            header.classList.remove('glass-nav');
        }
    });

    // 2. Parallax Hero Effect
    // 2. Hero Image Slider - Auto Scroll 10s
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 10000; // 10 seconds

        setInterval(() => {
            // Remove active class from current
            heroSlides[currentSlide].classList.remove('active');

            // Increment
            currentSlide = (currentSlide + 1) % heroSlides.length;

            // Add active class to next
            heroSlides[currentSlide].classList.add('active');
        }, slideInterval);
    }

    // 3. Liquid Reveal Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    // Observe both old .reveal and new .liquid-reveal
    document.querySelectorAll('.reveal, .liquid-reveal').forEach(el => observer.observe(el));

    // Countdown Timer logic
    const countdownTarget = new Date();
    countdownTarget.setDate(countdownTarget.getDate() + 3); // 3 days from now

    function updateCountdown() {
        const now = new Date();
        const diff = countdownTarget - now;

        if (diff <= 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const dEl = document.getElementById('days');
        if (dEl) {
            dEl.innerText = d < 10 ? '0' + d : d;
            document.getElementById('hours').innerText = h < 10 ? '0' + h : h;
            document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;
            document.getElementById('seconds').innerText = s < 10 ? '0' + s : s;
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // 4. Spotlight Carousel Logic
    window.toggleSpotlight = function (direction) {
        const slide1 = document.getElementById('spotlight-1');
        const slide2 = document.getElementById('spotlight-2');

        if (!slide1 || !slide2) return;

        // Simple Toggle for 2 slides
        if (getComputedStyle(slide1).display !== 'none') {
            slide1.style.display = 'none';
            slide2.style.display = 'block';
            // Trigger animation
            slide2.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
        } else {
            slide2.style.display = 'none';
            slide1.style.display = 'block';
            slide1.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
        }
    };
    // 5. Biting Chocolate Loader Injection
    const loaderHTML = `
        <div class="loader-wrapper">
            <div class="choco-loader">
                <div class="bite bite-1"></div>
                <div class="bite bite-2"></div>
                <div class="bite bite-3"></div>
            </div>
        </div>
    `;

    // Inject at top of body
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);

    // Hide Logic
    const loader = document.querySelector('.loader-wrapper');
    const minLoadTime = 2000; // Force 2s show so they see the animation
    const startTime = Date.now();

    function hideLoader() {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadTime - elapsed);

        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.remove(); // Remove from DOM
            }, 500);
        }, remaining);
    }

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }
});