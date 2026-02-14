const express = require("express");
const cors = require("cors");
const path = require("path");
// --- ZERO-DEPENDENCY MOCK DATABASE (Fixes Render Crash) ---
// We hold data in memory so the server starts instantly without sqlite3 errors.

// --- FILE-BASED DATABASE (Fixes Data Loss on Restart) ---
const fs = require('fs');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Load Products from File
let products = [];
try {
    if (fs.existsSync(PRODUCTS_FILE)) {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        products = JSON.parse(data);
        console.log(`✅ Loaded ${products.length} products from disk.`);
    } else {
        console.log("⚠️ products.json not found. Creating empty file.");
        fs.writeFileSync(PRODUCTS_FILE, '[]');
        products = [];
    }
} catch (err) {
    console.error("❌ Error loading products.json:", err);
    products = [];
}

// Helper to Save Products
function saveProductsToDisk() {
    try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        console.log("💾 Products saved to disk.");
    } catch (err) {
        console.error("❌ Error saving products.json:", err);
    }
}

// In-Memory Order Storage
const orders = [];

const db = {
    all: function (sql, params, cb) {
        // Return products
        if (sql.includes("products")) {
            let result = products;
            if (params && params.length > 0 && sql.includes("category")) {
                result = result.filter(p => p.category === params[0]);
            }
            return cb(null, result);
        }
        // Return orders
        if (sql.includes("FROM orders")) {
            return cb(null, orders);
        }
        return cb(null, []);
    },
    run: function (sql, params, cb) {
        console.log("Mock DB: Executing", sql);

        // Handle Order Insertion
        if (sql.includes("INSERT INTO orders")) {
            const newOrder = {
                id: orders.length + 1,
                customer_name: params[0],
                customer_email: params[1],
                shipping_address: params[2], // Already JSON string
                total_amount: params[3],
                items: params[4], // Already JSON string
                payment_status: params[5],
                transaction_id: params[6],
                payment_method: params[7],
                status: 'pending',
                created_at: new Date().toISOString()
            };
            orders.unshift(newOrder); // Add to top
            console.log("Mock DB: Order Saved!", newOrder.id);
            if (cb) cb.call({ lastID: newOrder.id }, null);
            return;
        }

        // Handle Order Status Update
        if (sql.includes("UPDATE orders SET status")) {
            // sql: UPDATE orders SET status = ? WHERE id = ?
            const id = params[1];
            const status = params[0];
            const order = orders.find(o => o.id == id);
            if (order) {
                order.status = status;
                console.log(`Mock DB: Order ${id} updated to ${status}`);
            }
            if (cb) cb.call({ changes: 1 }, null);
            return;
        }

        // Handle Delete
        if (sql.includes("DELETE FROM orders")) {
            orders.length = 0; // Clear array
            if (cb) cb.call({ changes: 0 }, null);
            return;
        }

        if (cb) cb.call({ lastID: Date.now() }, null);
    },
    get: function (sql, params, cb) {
        if (cb) cb(null, { count: products.length });
    }
};
const Razorpay = require("razorpay");
const crypto = require("crypto");

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_live_Qg11jTM5s0KRbh";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "5XwoEMtB1t66TcbrmNrj5N10";

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors({
    origin: '*', // Allow all origins for now (Phone/Desktop/etc)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());





/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
    res.send("✅ Server is running successfully");
});

/* -------------------- API ROUTES -------------------- */

// Get all products
app.get("/api/products", (req, res) => {
    const { category, priceRange } = req.query;

    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category && category !== "All Products") {
        sql += " AND category = ?";
        params.push(category);
    }

    if (priceRange) {
        if (priceRange === "Under ₹500") {
            sql += " AND price < 500";
        } else if (priceRange === "₹500 - ₹1000") {
            sql += " AND price BETWEEN 500 AND 1000";
        } else if (priceRange === "₹1000 - ₹2000") {
            sql += " AND price BETWEEN 1000 AND 2000";
        } else if (priceRange === "Above ₹2000") {
            sql += " AND price > 2000";
        }
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error("DB Error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        res.json({
            message: "success",
            data: rows,
        });
    });
});

// Add New Product
app.post("/api/products", (req, res) => {
    try {
        const newProduct = req.body;
        // Simple Validation
        if (!newProduct.name || !newProduct.price) {
            return res.status(400).json({ error: "Name and Price are required" });
        }

        // Auto-Increment ID
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        newProduct.id = maxId + 1;

        products.push(newProduct);
        saveProductsToDisk();

        res.json({ message: "Product added successfully", product: newProduct });
    } catch (e) {
        console.error("Add Product Error:", e);
        res.status(500).json({ error: "Failed to add product" });
    }
});

// Update Product
app.put("/api/products/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Merge updates
        products[index] = { ...products[index], ...req.body, id: id }; // Ensure ID doesn't change
        saveProductsToDisk();

        res.json({ message: "Product updated successfully", product: products[index] });
    } catch (e) {
        console.error("Update Product Error:", e);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// Delete Product
app.delete("/api/products/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const initialLength = products.length;
        products = products.filter(p => p.id !== id);

        if (products.length === initialLength) {
            return res.status(404).json({ error: "Product not found" });
        }

        saveProductsToDisk();
        res.json({ message: "Product deleted successfully" });
    } catch (e) {
        console.error("Delete Product Error:", e);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

// Create a new order
app.post("/api/orders", (req, res) => {
    console.log("📥 Received Order Payload:", JSON.stringify(req.body, null, 2)); // DEBUG LOG

    const {
        customer_name,
        customer_phone,
        shipping_address,
        total_amount,
        items,
        payment_status,
        transaction_id,
        payment_method,
    } = req.body;

    if (!customer_name || !total_amount || !items) {
        console.error("❌ Missing required fields:", { customer_name, total_amount, items });
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
    INSERT INTO orders 
    (customer_name, customer_email, shipping_address, total_amount, items, payment_status, transaction_id, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const params = [
        customer_name,
        customer_email || null,
        JSON.stringify(shipping_address || {}),
        total_amount,
        JSON.stringify(items),
        payment_status || "Pending",
        transaction_id || null,
        payment_method || "Unknown",
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("❌ DB Insert Error:", err.message); // CRITICAL DEBUG LOG
            return res.status(500).json({ error: err.message });
        }

        console.log(`✅ Order saved successfully. ID: ${this.lastID}`);

        // --- SEND WHATSAPP NOTIFICATION ---
        if (customer_phone) {
            sendWhatsapp(customer_phone, customer_name);
        }

        res.json({
            message: "success",
            orderId: this.lastID,
        });
    });
});

// --- WHATSAPP HELPER FUNCTION ---
async function sendWhatsapp(phone, name) {
    // Format phone: remove + or spaces, ensure it starts with 91 if indian
    let cleanPhone = phone.toString().replace(/\D/g, '');

    // Case 1: 10 digits (e.g., 9876543210) -> Add 91
    if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
    }
    // Case 2: 11 digits starting with 0 (e.g., 09876543210) -> Replace 0 with 91
    else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
        cleanPhone = "91" + cleanPhone.substring(1);
    }
    // Case 3: Already has 91 (e.g., 919876543210) -> Keep as is

    console.log(`📱 Sending WhatsApp to ${cleanPhone}...`);

    const data = {
        "key": "df66364294d64d7cbb2031cffb273847",
        "username": "chocoblossom1089588",
        "name": "whatsapp",
        "remarks": `Thank you for choosing *ChocoBlossom.* \n\nYour order is confirmed and is being crafted with care ✨\nOur delivery partner will keep you updated on the shipment 📦`,
        "whatsapp": {
            "to": cleanPhone,
            "type": "template",
            "category": "UTILITY",
            "recipient_type": "individual",
            "template": {
                "namespace": "",
                "language": {
                    "policy": "deterministic",
                    "code": "en"
                },
                "name": "order_msg"
            }
        }
    };

    try {
        const response = await fetch('https://services.kit19.com/IMS/Whatsapp/Template', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log("✅ WhatsApp Sent:", result);
    } catch (error) {
        console.error("❌ WhatsApp Error:", error);
    }
}

// --- HYBRID API ROUTE (Compatible with Vercel Structure) ---
// Handles both 'create_order' and 'verify_payment' actions on /api/razorpay
app.post("/api/razorpay", async (req, res) => {
    const { action } = req.body;

    // A. CREATE ORDER
    if (action === 'create_order') {
        try {
            const { amount, currency = "INR" } = req.body;
            if (!amount) return res.status(400).json({ error: "Amount is required" });

            const options = {
                amount: amount * 100, // Razorpay works in paise
                currency: currency,
                receipt: "order_rcptid_" + Date.now(),
            };
            const order = await razorpay.orders.create(options);
            return res.json(order);
        } catch (error) {
            console.error("Razorpay Order Error:", error);
            return res.status(500).json({ error: "Order Creation Failed" });
        }
    }

    // B. VERIFY PAYMENT
    if (action === 'verify_payment') {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const expectedSignature = crypto
                .createHmac("sha256", RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature === razorpay_signature) {
                return res.json({ status: "success", message: "Payment verified successfully" });
            } else {
                return res.status(400).json({ status: "failure", message: "Invalid signature" });
            }
        } catch (error) {
            console.error("Verification Error:", error);
            return res.status(500).json({ error: "Verification Failed" });
        }
    }

    return res.status(400).json({ error: "Invalid Action" });
});

// Create Razorpay Order
app.post("/api/create-razorpay-order", async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency: currency,
            receipt: "order_rcptid_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Verify Payment
app.post("/api/verify-payment", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        res.json({ status: "success", message: "Payment verified successfully" });
    } else {
        res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
});

/* -------------------- ADMIN AUTH -------------------- */
const adminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === "Bearer admin123") {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

/* -------------------- ADMIN ROUTES -------------------- */

// Get all orders
app.get("/api/admin/orders", adminAuth, (req, res) => {
    const sql = "SELECT * FROM orders ORDER BY created_at DESC";

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("DB Error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        res.json({
            message: "success",
            data: rows,
        });
    });
});

// Update order status
app.put("/api/admin/orders/:id", adminAuth, (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
        return res.status(400).json({ error: "Status is required" });
    }

    const sql = "UPDATE orders SET status = ? WHERE id = ?";

    db.run(sql, [status, id], function (err) {
        if (err) {
            console.error("DB Update Error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        res.json({
            message: "success",
            updated: this.changes,
        });
    });
});

// Reset all orders
app.delete("/api/admin/orders/reset", adminAuth, (req, res) => {
    db.run("DELETE FROM orders", [], function (err) {
        if (err) {
            console.error("DB Delete Error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        db.run("DELETE FROM sqlite_sequence WHERE name='orders'");
        res.json({ message: "All orders deleted successfully" });
    });
});

/* -------------------- START SERVER -------------------- */

/* -------------------- STATIC FILES -------------------- */
// Serve static frontend files from root directory (AFTER API ROUTES)
// This ensures /api requests are handled by routes above, not looked for as files
app.use(express.static(path.join(__dirname)));

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server successfully started on port ${PORT}`);
    console.log(`Health check available at http://0.0.0.0:${PORT}/`);
});

/* -------------------- ERROR HANDLING -------------------- */
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
});
