const express = require("express");
const cors = require("cors");
const path = require("path");
let db;
try {
    db = require("./database");
} catch (err) {
    console.error("CRITICAL: Database failed to initialize:", err);
    // Create a mock db object to prevent crash on route access
    db = {
        run: (q, p, cb) => { if (cb) cb(new Error("DB_OFFLINE")); },
        get: (q, p, cb) => { if (cb) cb(new Error("DB_OFFLINE")); },
        all: (q, p, cb) => { if (cb) cb(new Error("DB_OFFLINE")); }
    };
}
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

// Create a new order
app.post("/api/orders", (req, res) => {
    console.log("📥 Received Order Payload:", JSON.stringify(req.body, null, 2)); // DEBUG LOG

    const {
        customer_name,
        customer_email,
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

        res.json({
            message: "success",
            orderId: this.lastID,
        });
    });
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
