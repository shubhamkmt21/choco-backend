const API_URL = (window.location.port === '3000')
    ? '/api'
    : 'http://localhost:3000/api';

// Check Auth
// Check Auth
const token = localStorage.getItem('adminToken');
let pollingInterval;

if (token) {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // Initial Load
    loadDashboard();

    // Start Live Updates (Poll every 5 seconds)
    startLiveUpdates();
}

function startLiveUpdates() {
    // Prevent multiple intervals
    if (pollingInterval) clearInterval(pollingInterval);

    // Add Live Indicator
    const header = document.querySelector('header h1');
    if (header && !document.getElementById('live-badge')) {
        const badge = document.createElement('span');
        badge.id = 'live-badge';
        badge.innerHTML = '● Live';
        badge.style.cssText = 'font-size: 0.8rem; background: #e5ffe5; color: #008000; padding: 2px 8px; border-radius: 12px; margin-left: 10px; vertical-align: middle; border: 1px solid #008000; box-shadow: 0 0 5px rgba(0,128,0,0.2); animation: pulse 2s infinite;';

        // Add pulse animation style
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes pulse {
                0% { opacity: 0.8; }
                50% { opacity: 0.4; }
                100% { opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);

        header.appendChild(badge);
    }

    console.log("🟢 Live Admin Updates Enabled: Polling every 5s");
    pollingInterval = setInterval(() => {
        // Silent refresh (pass a flag if we want to suppress logs or loading spinners)
        loadDashboard(true);
    }, 5000);
}

function adminLogin() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === 'admin123') {
        localStorage.setItem('adminToken', 'Bearer admin123');
        location.reload();
    } else {
        document.getElementById('login-error').innerText = 'Invalid Password';
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    location.reload();
}

async function loadDashboard(isSilent = false) {
    // 1. SYNC OFFLINE ORDERS FIRST
    const offlineOrders = JSON.parse(localStorage.getItem('offlineOrders') || '[]');
    if (offlineOrders.length > 0) {
        let syncedCount = 0;
        console.log(`Attempting to sync ${offlineOrders.length} offline orders...`);

        // Try to sync each order
        const remainingOrders = [];
        for (const order of offlineOrders) {
            try {
                // MAPPING: Convert Frontend format to Backend format
                // If order has 'shipping' object but missing 'customer_name', map it.
                let payload = { ...order };

                if (order.shipping && !order.customer_name) {
                    payload.customer_name = order.shipping.name;
                    payload.customer_email = order.shipping.email;
                    payload.shipping_address = order.shipping;
                    // Remove frontend-only fields getting in the way? backend ignores extras usually.
                }

                if (order.total && !order.total_amount) {
                    payload.total_amount = order.total;
                }

                if (order.paymentMethod && !order.payment_method) {
                    payload.payment_method = order.paymentMethod;
                }

                // Ensure unique transaction ID
                // If it's an offline order loc-id, use that as txn id for reference
                if (order.orderId && order.orderId.startsWith('OFF-')) {
                    payload.transaction_id = order.orderId;
                } else if (!payload.transaction_id) {
                    payload.transaction_id = 'SYNC-' + Date.now();
                }

                // Remove ID so DB auto-increments (unless we want to store the offline ID somewhere else)
                delete payload.id;
                delete payload.orderId; // Backend doesn't use this column

                console.log("Syncing payload:", payload);

                const res = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    syncedCount++;
                } else {
                    console.warn("Server rejected order:", await res.text());
                    remainingOrders.push(order); // Failed, keep for later
                }
            } catch (e) {
                console.error("Sync failed for order", order, e);
                remainingOrders.push(order);
            }
        }

        // Update LocalStorage with only unsynced orders
        localStorage.setItem('offlineOrders', JSON.stringify(remainingOrders));

        if (syncedCount > 0) {
            alert(`Synced ${syncedCount} orders from Offline Mode to Backend Database! ☁️`);
        }
    }

    // 2. LOAD DASHBOARD AS USUAL
    let orders = [];
    try {
        const res = await fetch(`${API_URL}/admin/orders`, {
            headers: { 'Authorization': localStorage.getItem('adminToken') }
        });

        if (res.status === 401) {
            logout();
            return;
        }

        const json = await res.json();
        orders = json.data || [];
    } catch (error) {
        console.warn("Backend unreachable, loading local offline orders only.");
    }

    // MERGE: Combine API orders with any remaining offline orders (un-synced)
    // Avoid duplicates if sync partially worked
    const offlineIds = new Set(orders.map(o => o.transaction_id)); // Use txn ID as unique key if possible
    const localOrders = JSON.parse(localStorage.getItem('offlineOrders') || '[]');
    const backupOrders = JSON.parse(localStorage.getItem('allLocalOrders') || '[]');

    // 1. Add Pending Offline Orders
    localOrders.forEach(o => {
        const uniqueId = o.transaction_id || o.orderId;
        if (!offlineIds.has(uniqueId)) {
            o._isOffline = true;
            orders.unshift(o);
            offlineIds.add(uniqueId); // Mark added
        }
    });

    // 2. Add Backup History (if missing from both API and Offline)
    // This restores data if backend was wiped but user has local history
    backupOrders.forEach(o => {
        const uniqueId = o.transaction_id || o.orderId;
        if (!offlineIds.has(uniqueId)) { // If not in API and not in pending queue
            // We treat it as a "Historical" order. We don't mark it offline (yellow) unless we know it failed sync.
            // But for safety, if it's missing from API, let's show it.
            // Maybe give it a different visual cue or just show it normal?
            // Let's mark it slightly different or just include it.
            o._isHistory = true;
            orders.push(o);
            offlineIds.add(uniqueId);
        }
    });

    // Sort by Date Descending
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Update Stats
    document.getElementById('total-orders').innerText = orders.length;

    const revenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    document.getElementById('total-revenue').innerText = `₹${revenue}`;

    const pending = orders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s === 'pending verification' || s === 'pending';
    }).length;
    document.getElementById('pending-orders').innerText = pending;

    // Populate Table
    const tbody = document.getElementById('orders-list');
    tbody.innerHTML = '';

    orders.forEach(order => {
        // NORMALIZE FIELDS (Handle formatting differences between API vs LocalStorage)
        if (!order.id) order.id = order.orderId || order.transaction_id || 'N/A';
        if (!order.status) order.status = order.payment_status || 'Pending';

        const tr = document.createElement('tr');
        if (order._isOffline) tr.style.background = '#fff8e1'; // Highlight offline orders

        // Format Items
        let itemsHtml = '';
        try {
            let items = order.items;
            if (typeof items === 'string') {
                items = JSON.parse(items);
            }
            itemsHtml = items.map(i => `${i.name} (x${i.quantity})`).join(', ');
        } catch (e) {
            itemsHtml = 'Error parsing items';
        }

        // Parse Address
        let addressHtml = '<small>N/A</small>';
        try {
            if (order.shipping_address) {
                let addr = order.shipping_address;
                if (typeof addr === 'string') {
                    addr = JSON.parse(addr);
                }
                addressHtml = `<small>${addr.street}, ${addr.city} - ${addr.pincode}</small>`;
            }
        } catch (e) {
            addressHtml = '<small>Invalid Format</small>';
        }

        // Status Class
        let statusClass = 'status-pending';
        if (order.status === 'Shipped') statusClass = 'status-shipped';
        if (order.status === 'Cancelled') statusClass = 'status-cancelled';

        // Actions Column
        const actionTd = document.createElement('td');
        actionTd.style.width = "180px"; // Ensure sufficient width

        const actionContainer = document.createElement('div');
        actionContainer.style.display = "flex";
        actionContainer.style.gap = "0.5rem";
        actionContainer.style.flexWrap = "wrap"; // Allow weak wrap

        // Ship Button
        if (order.status !== 'Shipped' && order.status !== 'Cancelled') {
            const shipBtn = document.createElement('button');
            shipBtn.className = 'action-btn btn-ship';
            shipBtn.title = "Mark as Shipped";
            shipBtn.innerHTML = '<i class="fas fa-shipping-fast"></i> Ship';
            shipBtn.onclick = () => updateStatus(order.id, 'Shipped');
            actionContainer.appendChild(shipBtn);
        }

        // Cancel Button
        if (order.status !== 'Cancelled') {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'action-btn btn-cancel';
            cancelBtn.title = "Cancel Order";
            cancelBtn.innerHTML = '<i class="fas fa-ban"></i>';
            cancelBtn.onclick = () => updateStatus(order.id, 'Cancelled');
            actionContainer.appendChild(cancelBtn);
        }

        // Delete Button (New)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn btn-delete';
        deleteBtn.title = "Delete Record";
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.onclick = () => deleteOrder(order.id);
        actionContainer.appendChild(deleteBtn);

        actionTd.appendChild(actionContainer);

        // Assemble Row
        tr.innerHTML = `
                <td>#${order.id}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <div style="font-weight: 600; color: var(--color-primary);">${order.customer_name}</div>
                    <div style="font-size: 0.8rem; color: #777;">${order.customer_email}</div>
                </td>
                <td style="max-width: 250px;">${itemsHtml}</td>
                <td style="font-weight: bold;">₹${order.total_amount}</td>
                <td style="max-width: 200px;">${addressHtml}</td>
                <td>
                    <strong>${(order.payment_method || 'N/A').toUpperCase()}</strong><br>
                    <small style="font-size:0.75rem; color:#888;">${order.transaction_id || ''}</small>
                </td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
            `;
        tr.appendChild(actionTd); // Append custom action TD

        tbody.appendChild(tr);
    });
}

async function updateStatus(id, status) {
    if (!confirm(`Mark order #${id} as ${status}?`)) return;

    let success = false;

    // 1. Try Backend Update
    try {
        const res = await fetch(`${API_URL}/admin/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('adminToken')
            },
            body: JSON.stringify({ status })
        });
        if (res.ok) success = true;
    } catch (e) {
        console.warn("Backend update failed, trying local Update");
    }

    // 2. Local Update (Offline/Backup Orders)
    // Even if backend works, we update local backup to stay in sync
    const updateLocal = (key) => {
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        let modified = false;
        list.forEach(o => {
            // Check both ID types
            if (o.id == id || o.orderId == id || o.transaction_id == id) {
                o.status = status;
                o.payment_status = status; // Keep synced
                modified = true;
            }
        });
        if (modified) {
            localStorage.setItem(key, JSON.stringify(list));
            success = true; // Mark as success if at least local update worked
        }
    };

    updateLocal('offlineOrders');
    updateLocal('allLocalOrders');

    if (success) {
        // UI Refresh without full reload for cleaner UX
        // But loadDashboard() is safer to ensure consistency
        loadDashboard();

        // Optional: Show toast or small alert? User dislikes alerts.
        // Let the UI change speak for itself.
    } else {
        alert("Failed to update status. Order not found locally or on server.");
    }
}

// New: Delete Individual Order
async function deleteOrder(id) {
    if (!confirm(`Are you sure you want to PERMANENTLY delete order #${id}?`)) return;
    // Note: Backend might not support single delete yet, but good for UI. 
    // If backend doesn't support, we can just hide it or implement backend route later.
    // For now assuming we might need to add route or just show alert.
    alert("Delete feature coming soon to backend!");
}

async function resetDatabase() {
    if (!confirm("Are you sure you want to DELETE ALL ORDERS? This cannot be undone.")) return;

    try {
        const res = await fetch(`${API_URL}/admin/orders/reset`, {
            method: 'DELETE',
            headers: {
                'Authorization': localStorage.getItem('adminToken')
            }
        });

        if (res.ok) {
            alert("Database Reset Successfully");
            loadDashboard();
        } else {
            alert("Failed to reset database");
        }
    } catch (e) {
        console.error(e);
        alert("Error connecting to server");
    }
}

// Export CSV (Excel Compatible) Function
async function exportToCSV() {
    try {
        const res = await fetch(`${API_URL}/admin/orders`, {
            headers: { 'Authorization': localStorage.getItem('adminToken') }
        });

        if (!res.ok) throw new Error("Failed to fetch orders for export");

        const json = await res.json();
        const orders = json.data;

        if (orders.length === 0) {
            alert("No orders to export!");
            return;
        }

        // CSV Headers associated with Excel columns
        const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Items Summary", "Total Amount (INR)", "Payment Method", "Transaction ID", "Status", "Shipping Address"];

        // Map Data to CSV Rows
        const rows = orders.map(order => {
            // Flatten Items
            let itemsStr = "";
            try {
                const items = JSON.parse(order.items);
                itemsStr = items.map(i => `${i.name} x${i.quantity}`).join(' | ');
            } catch { itemsStr = "Error"; }

            // Flatten Address
            let addrStr = "";
            try {
                if (order.shipping_address) {
                    const addr = JSON.parse(order.shipping_address);
                    addrStr = `${addr.street}, ${addr.city} - ${addr.pincode}`;
                }
            } catch { addrStr = "N/A"; }

            // Escape commas for CSV
            const escape = (text) => {
                if (!text) return "";
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
                escape(order.customer_email),
                escape(itemsStr),
                order.total_amount,
                escape(order.payment_method),
                escape(order.transaction_id),
                escape(order.status),
                escape(addrStr)
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

// Export PDF (Bank Statement Style)
async function exportToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // 1. Fetch Data
        const res = await fetch(`${API_URL}/admin/orders`, {
            headers: { 'Authorization': localStorage.getItem('adminToken') }
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const json = await res.json();
        const orders = json.data;

        if (orders.length === 0) {
            alert("No orders to export!");
            return;
        }

        // 2. Financial Calculations
        // Assuming 'Opening Balance' is 0 for the start of this specific statement period (all time)
        // In a real app, this would be the balance before the filter date range.
        let openingBalance = 0;

        let totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        let closingBalance = openingBalance + totalRevenue;

        // 3. Document Setup
        const pageWidth = doc.internal.pageSize.width;

        // --- HEADER ---

        // Logo (Drawing a simple vector placeholder if image load fails or just for speed)
        // Ideally we load the actual image. Let's try to draw a simple "Chocolate Square" SVG-like shape
        doc.setFillColor(62, 39, 35); // Dark Brown
        doc.rect(15, 15, 20, 20, 'F');
        doc.setFontSize(16);
        doc.setTextColor(62, 39, 35);
        doc.text("C H O C O", 40, 22);
        doc.text("B L O S S O M", 40, 29);

        // Company Info (Right Side)
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Choco Blossom Inc.", pageWidth - 15, 20, { align: 'right' });
        doc.text("123 Sweet Street, Candy City", pageWidth - 15, 25, { align: 'right' });
        doc.text("support@chocoblossom.com", pageWidth - 15, 30, { align: 'right' });

        // Divider
        doc.setDrawColor(200);
        doc.line(15, 40, pageWidth - 15, 40);

        // --- STATEMENT DETAILS ---
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Statement of Account", 15, 55);

        doc.setFontSize(10);
        doc.setTextColor(100);
        const dateStr = new Date().toLocaleDateString();
        doc.text(`Statement Date: ${dateStr}`, 15, 62);

        // Account Summary Box
        doc.setFillColor(248, 249, 250);
        doc.rect(pageWidth - 85, 48, 70, 22, 'F'); // Background
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text("Opening Balance:", pageWidth - 80, 55);
        doc.text("Closing Balance:", pageWidth - 80, 63);

        doc.setFontSize(10);
        doc.setTextColor(0); // Black for amounts
        doc.text(`INR ${openingBalance.toFixed(2)}`, pageWidth - 20, 55, { align: 'right' });
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`INR ${closingBalance.toFixed(2)}`, pageWidth - 20, 63, { align: 'right' });
        doc.setFont("helvetica", "normal");

        // --- TABLE ---
        const tableColumn = ["Date", "Order ID", "Description", "Ref / Txn ID", "Status", "Amount (INR)"];
        const tableRows = [];

        orders.forEach(order => {
            // Simplified Description for Statement
            let desc = `Order by ${order.customer_name}`;
            const date = new Date(order.created_at).toLocaleDateString();
            const amount = order.total_amount.toFixed(2);

            tableRows.push([
                date,
                order.id,
                desc,
                order.transaction_id || '-',
                order.status,
                amount
            ]);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 80,
            theme: 'striped',
            headStyles: { fillColor: [62, 39, 35], textColor: 255 }, // Chocolate Header
            columnStyles: {
                0: { cellWidth: 25 }, // Date
                1: { cellWidth: 20 }, // ID
                2: { cellWidth: 'auto' }, // Desc
                5: { halign: 'right' } // Amount Right Aligned
            },
            foot: [['', '', '', 'Total Credit', '', totalRevenue.toFixed(2)]],
            footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', halign: 'right' }
        });

        // --- FOOTER ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
            doc.text("Generated by Choco Blossom Admin Panel", 15, doc.internal.pageSize.height - 10);
        }

        // Save
        doc.save(`statement_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (e) {
        console.error("PDF Error:", e);
        alert("Failed to generate PDF. Make sure scripts are loaded.");
    }
}

// --- VIEW NAVIGATION ---
function switchView(view) {
    // Hide all views
    document.getElementById('view-orders').style.display = 'none';
    document.getElementById('view-products').style.display = 'none';

    // Deactivate navs
    document.getElementById('nav-orders').classList.remove('active');
    document.getElementById('nav-products').classList.remove('active');

    // Show selected
    document.getElementById(`view-${view}`).style.display = 'block';
    document.getElementById(`nav-${view}`).classList.add('active');

    if (view === 'products') {
        loadProducts();
    }
}

// --- PRODUCT MANAGEMENT ---
// Get products from LocalStorage OR revert to default Data.js
function getProductList() {
    let products = [];
    const stored = localStorage.getItem('adminProducts');
    if (stored) {
        products = JSON.parse(stored);
    }

    // Merge logic: If we have static data (window.PRODUCTS_DATA), make sure they are in the list
    if (window.PRODUCTS_DATA) {
        // 1. Add missing items
        const currentIds = new Set(products.map(p => p.id));
        const newItems = window.PRODUCTS_DATA.filter(p => !currentIds.has(p.id));

        if (newItems.length > 0) {
            console.log(`Merging ${newItems.length} new products from static data into Admin`);
            products = [...products, ...newItems];
            // Update storage immediately so they persist
            localStorage.setItem('adminProducts', JSON.stringify(products));
        }

        // 2. Sync Images (Fix for "No Image" issue if static path update)
        let changed = false;
        window.PRODUCTS_DATA.forEach(staticP => {
            const match = products.find(p => p.id == staticP.id);
            if (match && match.image !== staticP.image) {
                console.log(`Syncing image for ${match.name}`);
                match.image = staticP.image;
                changed = true;
            }
        });

        if (changed) {
            localStorage.setItem('adminProducts', JSON.stringify(products));
        }
    }

    // Fallback: If still empty and no static data
    if (products.length === 0 && window.PRODUCTS_DATA) {
        products = window.PRODUCTS_DATA;
        localStorage.setItem('adminProducts', JSON.stringify(products));
    }

    return products;
}

function loadProducts() {
    const products = getProductList();
    const tbody = document.getElementById('products-list');
    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        // Escape content to prevent HTML injection
        const safeName = p.name.replace(/"/g, '&quot;');

        tr.innerHTML = `
            <td><img src="${p.image}" class="prod-thumb" onerror="this.src='https://placehold.co/50x50?text=No+Img'"></td>
            <td style="font-weight: 600;">${p.name}</td>
            <td><span class="status-badge status-shipped" style="background: #f0f0f0; color: #555;">${p.category}</span></td>
            <td>₹${p.price}</td>
            <td style="font-size: 0.85rem; color: #777; max-width: 250px;">${p.description.substring(0, 50)}...</td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button class="action-btn" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn btn-delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editProduct(id) {
    const products = getProductList();
    const product = products.find(p => p.id == id);
    if (product) {
        openProductModal(product);
    } else {
        alert("Product not found!");
    }
}

// Modal Logic
function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');

    modal.style.display = 'flex';

    if (product) {
        title.innerText = "Edit Product";
        document.getElementById('p-id').value = product.id;
        document.getElementById('p-name').value = product.name;
        document.getElementById('p-category').value = product.category;
        document.getElementById('p-price').value = product.price;
        document.getElementById('p-image').value = product.image;
        document.getElementById('p-image-file').value = ''; // Reset file input
        document.getElementById('p-desc').value = product.description;
    } else {
        title.innerText = "Add New Product";
        document.getElementById('p-id').value = '';
        document.getElementById('p-name').value = '';
        document.getElementById('p-category').value = 'Truffles';
        document.getElementById('p-price').value = '';
        document.getElementById('p-image').value = '';
        document.getElementById('p-image-file').value = '';
        document.getElementById('p-desc').value = '';
    }

    // Auto-fill URL from File
    document.getElementById('p-image-file').onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                // Set the Base64 string as the URL
                document.getElementById('p-image').value = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function saveProduct() {
    const id = document.getElementById('p-id').value;
    const name = document.getElementById('p-name').value;
    const category = document.getElementById('p-category').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const image = document.getElementById('p-image').value || 'https://placehold.co/600x600?text=No+Image';
    const description = document.getElementById('p-desc').value;

    if (!name || !price) {
        alert("Name and Price are required!");
        return;
    }

    let products = getProductList();

    if (id) {
        // Edit Mode
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { ...products[index], name, category, price, image, description };
        }
    } else {
        // Add Mode
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, name, category, price, image, description });
    }

    localStorage.setItem('adminProducts', JSON.stringify(products));
    closeProductModal();
    loadProducts();
    alert("Product Saved!");
}

function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    let products = getProductList();
    products = products.filter(p => p.id != id);

    localStorage.setItem('adminProducts', JSON.stringify(products));
    loadProducts();
}
