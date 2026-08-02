// Admin Dashboard Logic (Hostinger PHP Version)

const PRODUCTS_API = 'products_manager.php';
const ORDERS_API = 'order_manager.php';
const AUTH_TOKEN = 'Bearer admin123';

// --- Authentication ---
function adminLogin() {
    const pass = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('login-error');

    if (pass === '1234' || pass === 'admin') {
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        errorMsg.textContent = 'Invalid Password';
        errorMsg.style.display = 'block';
    }
}

function checkAuth() {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
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
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading orders...</td></tr>';

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
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 700;">#${o.id}</td>
                <td>${date}</td>
                <td>
                    <div style="font-weight: 600;">${o.customer_name}</div>
                    <div style="font-size: 0.75rem; color: #777;">${o.customer_email}</div>
                </td>
                <td style="font-size: 0.85rem; max-width: 250px;">${items}</td>
                <td style="font-weight: 700;">₹${o.total_amount}</td>
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error loading orders.</td></tr>';
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

window.onload = checkAuth;
