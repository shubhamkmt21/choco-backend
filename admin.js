// Admin Dashboard Logic (Hostinger PHP Version)

const PRODUCTS_API = 'products_manager.php';
const ORDERS_API = 'order_manager.php';
const AUTH_TOKEN = 'Bearer admin123';

// --- Authentication ---
let currentCaptcha = "";

function generateCaptcha() {
    const canvas = document.getElementById("captcha-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background noise dots
    ctx.fillStyle = "#faf6f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Characters list (excluding confusing ones like I, l, 1, 0, O)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    currentCaptcha = "";
    for (let i = 0; i < 5; i++) {
        currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Write captcha text with rotation/scaling/skewing
    ctx.font = "bold 24px 'Outfit', 'Inter', sans-serif";
    ctx.textBaseline = "middle";
    for (let i = 0; i < currentCaptcha.length; i++) {
        const char = currentCaptcha[i];
        ctx.save();
        const x = 12 + i * 24 + Math.random() * 5;
        const y = canvas.height / 2 + (Math.random() * 8 - 4);
        const angle = (Math.random() * 30 - 15) * Math.PI / 180;
        
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 30%)`;
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }
    
    // Add noise lines
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150}, 0.3)`;
        ctx.lineWidth = 1 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }
}

function adminLogin() {
    const pass = document.getElementById('admin-pass').value;
    const captchaVal = document.getElementById('captcha-input').value.trim();
    const errorMsg = document.getElementById('login-error');

    // 1. Verify Captcha
    if (!captchaVal) {
        errorMsg.textContent = 'Please enter the captcha code';
        errorMsg.style.display = 'block';
        return;
    }
    if (captchaVal.toLowerCase() !== currentCaptcha.toLowerCase()) {
        errorMsg.textContent = 'Invalid Captcha Code';
        errorMsg.style.display = 'block';
        generateCaptcha(); // Regenerate captcha on failure
        document.getElementById('captcha-input').value = "";
        return;
    }

    // 2. Verify Password
    if (pass === '8081' || pass === 'admin') {
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        errorMsg.textContent = 'Invalid Password';
        errorMsg.style.display = 'block';
        generateCaptcha(); // Regenerate captcha on failure
        document.getElementById('captcha-input').value = "";
    }
}

function checkAuth() {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    } else {
        generateCaptcha();
    }
}

function showDashboard() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    initDashboard();
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    location.reload();
}

// --- Navigation ---
function switchView(viewName) {
    document.getElementById('view-orders').style.display = 'none';
    document.getElementById('view-products').style.display = 'none';
    document.getElementById('nav-orders').classList.remove('active');
    document.getElementById('nav-products').classList.remove('active');

    document.getElementById(`view-${viewName}`).style.display = 'block';
    document.getElementById(`nav-${viewName}`).classList.add('active');

    if (viewName === 'products') loadProducts();
    if (viewName === 'orders') loadOrders();
}

// --- Dashboard Initialization ---
function initDashboard() {
    updateStats();
    switchView('orders');
}

async function updateStats() {
    try {
        const res = await fetch(ORDERS_API, {
            headers: { 'Authorization': AUTH_TOKEN }
        });
        const json = await res.json();
        const orders = json.data || [];

        document.getElementById('total-orders').innerText = orders.length;
        const revenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
        document.getElementById('total-revenue').innerText = `₹${revenue.toFixed(2)}`;
        
        const pending = orders.filter(o => o.status === 'pending').length;
        document.getElementById('pending-orders').innerText = pending;
    } catch (e) {
        console.error("Stats Error", e);
    }
}

// --- PRODUCT MANAGEMENT ---

async function loadProducts() {
    const tbody = document.getElementById('products-list');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading products...</td></tr>';

    try {
        const res = await fetch(PRODUCTS_API);
        const json = await res.json();
        const products = json.data || [];

        tbody.innerHTML = '';
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products found.</td></tr>';
            return;
        }

        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.image}" class="prod-thumb" onerror="this.src='https://placehold.co/50x50?text=No+Img'"></td>
                <td style="font-weight: 600;">${p.name}</td>
                <td><span class="status-badge" style="background:#EEE; color:#333;">${p.category}</span></td>
                <td>₹${p.price}</td>
                <td style="font-size: 0.85rem; color: #777; max-width: 200px;">${(p.description || '').substring(0, 50)}...</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn" onclick="openEditModal(${p.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn btn-delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error loading products.</td></tr>';
    }
}

async function openEditModal(id) {
    const res = await fetch(PRODUCTS_API);
    const json = await res.json();
    const p = json.data.find(x => x.id == id);
    if (!p) return;

    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-category').value = p.category;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-image').value = p.image;
    document.getElementById('p-desc').value = p.description;
    document.getElementById('modal-title').innerText = 'Edit Product';

    document.getElementById('product-modal').style.display = 'flex';
}

function openProductModal() {
    document.getElementById('p-id').value = '';
    document.getElementById('p-name').value = '';
    document.getElementById('p-category').value = 'Truffles';
    document.getElementById('p-price').value = '';
    document.getElementById('p-image').value = '';
    document.getElementById('p-image-file').value = '';
    document.getElementById('p-desc').value = '';
    document.getElementById('modal-title').innerText = 'Add New Product';
    document.getElementById('product-modal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

async function saveProduct() {
    const id = document.getElementById('p-id').value;
    const name = document.getElementById('p-name').value;
    const category = document.getElementById('p-category').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const desc = document.getElementById('p-desc').value;
    
    let imageUrl = document.getElementById('p-image').value;
    const imageFile = document.getElementById('p-image-file').files[0];

    if (!name || !price) {
        alert("Name and Price are required!");
        return;
    }

    // 1. Handle Image Upload if file selected
    if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
            const uploadRes = await fetch('upload_image.php', {
                method: 'POST',
                body: formData
            });
            const uploadJson = await uploadRes.json();
            if (uploadJson.url) {
                imageUrl = uploadJson.url;
            }
        } catch (e) {
            console.error("Upload failed", e);
        }
    }

    const data = {
        name: name,
        category: category,
        price: price,
        image: imageUrl,
        description: desc
    };

    const url = id ? `${PRODUCTS_API}?id=${id}` : PRODUCTS_API;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': AUTH_TOKEN
            },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeProductModal();
            loadProducts();
            alert("Product Saved!");
        }
    } catch (e) {
        alert("Error saving product.");
    }
}

async function deleteProduct(id) {
    if (!confirm("Are you sure?")) return;
    try {
        await fetch(`${PRODUCTS_API}?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': AUTH_TOKEN }
        });
        loadProducts();
    } catch (e) { alert("Delete failed."); }
}

// --- ORDER MANAGEMENT ---

async function loadOrders() {
    const tbody = document.getElementById('orders-list');
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Loading orders...</td></tr>';

    try {
        const res = await fetch(ORDERS_API, {
            headers: { 'Authorization': AUTH_TOKEN }
        });
        const json = await res.json();
        const orders = json.data || [];

        tbody.innerHTML = '';
        orders.forEach(o => {
            const date = new Date(o.created_at).toLocaleDateString();
            let itemsArray = [];
            if (typeof o.items === 'string') {
                try {
                    itemsArray = JSON.parse(o.items || '[]');
                } catch (e) {
                    itemsArray = [];
                }
            } else if (Array.isArray(o.items)) {
                itemsArray = o.items;
            }
            const items = itemsArray.map(i => `${i.name} (x${i.quantity})`).join(', ');

            // Parse Shipping Address
            let addressHtml = 'N/A';
            try {
                if (o.shipping_address) {
                    let addr = o.shipping_address;
                    if (typeof addr === 'string') {
                        addr = JSON.parse(addr);
                    }
                    if (addr && typeof addr === 'object') {
                        addressHtml = `<small>${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}</small>`;
                    } else {
                        addressHtml = `<small>${addr}</small>`;
                    }
                }
            } catch (e) {
                addressHtml = '<small>Invalid Format</small>';
            }

            // Append Greetings to Location/Address column
            if (o.greetings) {
                addressHtml += `<div style="margin-top: 5px; padding: 4px 6px; background: #fff3e0; border-left: 3px solid #ff9800; font-size: 0.75rem; border-radius: 2px; line-height: 1.2; color: #3e2723; text-align: left;"><strong>Greeting:</strong> "${o.greetings}"</div>`;
            }

            // Payment HTML
            const paymentMethod = (o.payment_method || 'N/A').toUpperCase();
            const paymentStatus = o.payment_status || 'Pending';
            const paymentHtml = `
                <div><strong>${paymentMethod}</strong></div>
                <div style="font-size: 0.75rem; color: ${paymentStatus === 'Paid' ? '#2e7d32' : '#f57c00'}; font-weight: 600;">${paymentStatus}</div>
                ${o.transaction_id ? `<div style="font-size: 0.7rem; color: #888;">${o.transaction_id}</div>` : ''}
            `;
            
            // Format Delivery Preference
            let deliveryPrefHtml = "";
            if (o.delivery_type === 'specific' && o.delivery_date) {
                // Formatting delivery date nicely
                const delivDate = new Date(o.delivery_date).toLocaleDateString();
                deliveryPrefHtml = `<div style="margin-top: 5px; font-size: 0.72rem; color: #b71c1c; font-weight: 600; background: #ffebee; padding: 2px 5px; border-radius: 4px; display: inline-block;">📅 Specific: ${delivDate}</div>`;
            } else {
                deliveryPrefHtml = `<div style="margin-top: 5px; font-size: 0.72rem; color: #555; background: #f5f5f5; padding: 2px 5px; border-radius: 4px; display: inline-block;">⚡ Regular</div>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 700;">#${o.id}</td>
                <td>
                    <div>${date}</div>
                    ${deliveryPrefHtml}
                </td>
                <td>
                    <div style="font-weight: 600;">${o.customer_name}</div>
                    <div style="font-size: 0.75rem; color: #777;">${o.customer_email}</div>
                    ${o.customer_phone ? `<div style="font-size: 0.75rem; color: #777;">${o.customer_phone}</div>` : ''}
                </td>
                <td style="font-size: 0.85rem; max-width: 250px;">${items}</td>
                <td style="font-weight: 700;">₹${o.total_amount}</td>
                <td style="font-size: 0.85rem; max-width: 200px;">${addressHtml}</td>
                <td>${paymentHtml}</td>
                <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                <td>
                    <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding: 4px; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("Error loading orders:", e);
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">Error loading orders.</td></tr>';
    }
}

async function updateOrderStatus(id, status) {
    try {
        await fetch(`${ORDERS_API}?id=${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': AUTH_TOKEN
            },
            body: JSON.stringify({ status: status })
        });
        loadOrders();
        updateStats();
    } catch (e) { alert("Update failed."); }
}

async function resetDatabase() {
    if (!confirm("⚠️ PERMANENTLY CLEAR ALL ORDERS?")) return;
    try {
        await fetch(`${ORDERS_API}?reset=true`, {
            method: 'DELETE',
            headers: { 'Authorization': AUTH_TOKEN }
        });
        location.reload();
    } catch (e) { alert("Reset failed."); }
}

async function exportToCSV() {
    try {
        const res = await fetch(ORDERS_API, {
            headers: { 'Authorization': AUTH_TOKEN }
        });

        if (!res.ok) throw new Error("Failed to fetch orders for export");

        const json = await res.json();
        const orders = json.data || [];

        if (orders.length === 0) {
            alert("No orders to export!");
            return;
        }

        // CSV Headers associated with Excel columns
        const headers = ["Order ID", "Date", "Customer Name", "Customer Phone", "Customer Email", "Items Summary", "Total Amount (INR)", "Payment Method", "Payment Status", "Transaction ID", "Status", "Shipping Address", "Greetings", "Delivery Preference", "Delivery Date"];

        // Map Data to CSV Rows
        const rows = orders.map(order => {
            // Flatten Items
            let itemsStr = "";
            try {
                let itemsArray = [];
                if (typeof order.items === 'string') {
                    itemsArray = JSON.parse(order.items || '[]');
                } else if (Array.isArray(order.items)) {
                    itemsArray = order.items;
                }
                itemsStr = itemsArray.map(i => `${i.name} x${i.quantity}`).join(' | ');
            } catch (e) {
                itemsStr = "Error";
            }

            // Flatten Address
            let addrStr = "";
            try {
                if (order.shipping_address) {
                    let addr = order.shipping_address;
                    if (typeof addr === 'string') {
                        addr = JSON.parse(addr);
                    }
                    if (addr && typeof addr === 'object') {
                        addrStr = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`;
                    } else {
                        addrStr = String(addr);
                    }
                }
            } catch (e) {
                addrStr = "N/A";
            }

            // Escape commas/quotes/newlines for CSV
            const escape = (text) => {
                if (text === null || text === undefined) return "";
                const str = String(text);
                if (str.includes(",") || str.includes("\n") || str.includes('"')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            return [
                order.id,
                new Date(order.created_at).toLocaleDateString(),
                escape(order.customer_name),
                escape(order.customer_phone),
                escape(order.customer_email),
                escape(itemsStr),
                order.total_amount,
                escape(order.payment_method),
                escape(order.payment_status),
                escape(order.transaction_id),
                escape(order.status),
                escape(addrStr),
                escape(order.greetings || ""),
                escape(order.delivery_type || "regular"),
                escape(order.delivery_date || "")
            ].join(",");
        });

        // Combine Header and Rows
        const csvContent = [headers.join(","), ...rows].join("\n");

        // Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `choco_orders_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (e) {
        console.error("Export Error:", e);
        alert("Failed to export data.");
    }
}

window.onload = checkAuth;
