const express = require("express");
const cors = require("cors");
const path = require("path");
// --- ZERO-DEPENDENCY MOCK DATABASE (Fixes Render Crash) ---
// We hold data in memory so the server starts instantly without sqlite3 errors.

const products = [
    { id: 1, name: "Classic Almond Truffles", category: "Truffles", price: 850, image: "images/truffle1.jpg", description: "Rich almond center encased in smooth milk chocolate." },
    { id: 2, name: "Cocoa Dust Truffles", category: "Truffles", price: 950, image: "images/truffle2.jpg", description: "Intense dark chocolate with a dusting of premium cocoa powder." },
    { id: 3, name: "Hazelnut Truffle Box", category: "Truffles", price: 1200, image: "images/truffle3.jpg", description: "Crunchy hazelnuts paired with creamy truffle filling." },
    { id: 4, name: "Coconut Truffle Selection", category: "Truffles", price: 750, image: "images/truffle4.jpg", description: "Exotic coconut flavor wrapped in Belgian chocolate." },
    { id: 5, name: "Assorted Nut Truffles", category: "Truffles", price: 1100, image: "images/truffle5.jpg", description: "A nutty delight featuring almonds, cashews, and pistachios." },
    { id: 6, name: "Candied Orange Bar", category: "Bars", price: 450, image: "images/bar_candied_orange.jpg", description: "Dark chocolate infused with zesty candied orange peel." },
    { id: 7, name: "Crunchy Hazelnut Bar", category: "Bars", price: 480, image: "images/bar_crunchy_hazelnut.jpg", description: "Packed with roasted hazelnuts for a satisfying crunch." },
    { id: 8, name: "Fruits & Nuts Bar", category: "Bars", price: 500, image: "images/bar_fruits_nuts.jpg", description: "A classic combination of raisins, cashews, and almonds." },
    { id: 9, name: "Roasted Almond Bar", category: "Bars", price: 480, image: "images/bar_roasted_almond.jpg", description: "Golden roasted almonds embedded in rich milk chocolate." },
    { id: 10, name: "Pistachio Cranberry Bar", category: "Bars", price: 550, image: "images/bar_pistachio_cranberry.jpg", description: "Tangy cranberries meet premium pistachios in white chocolate." },
    { id: 11, name: "Handcrafted Pecan Bar", category: "Bars", price: 600, image: "images/bar_pecan.jpg", description: "Buttery pecans with caramel notes in artisan chocolate." },
    { id: 12, name: "Pistachio Kunafa Bar", category: "Bars", price: 750, image: "images/bar_kunafa.jpg", description: "Viral sensation! Crunchy kunafa pastry with pistachio cream." },
    { id: 13, name: "English Brittle", category: "Chocoblossom Special", price: 650, image: "images/english_brittle.jpg", description: "Classic crunchy caramelized sugar with embedded roasted nuts." },
    { id: 14, name: "Chocolate Thins In Milk", category: "Chocoblossom Special", price: 550, image: "images/thins_milk.jpg", description: "Delicate, wafer-thin sheets of creamy milk chocolate that melt on the tongue." },
    { id: 15, name: "Almond Florentine", category: "Chocoblossom Special", price: 700, image: "images/almond_florentine.jpg", description: "Crispy almond discs coated in caramel and dipped in chocolate." },
    { id: 16, name: "Chocolate Thins In Dark", category: "Chocoblossom Special", price: 550, image: "images/thins_dark.jpg", description: "Intense 70% dark chocolate wafers for the true cocoa connoisseur." },
    { id: 17, name: "Almond Roca", category: "Chocoblossom Special", price: 750, image: "images/almond_roca.jpg", description: "Buttercrunch toffee with almonds, covered in chocolate and almond dust." },
    { id: 18, name: "Chocolate Coated Orange Peel", category: "Chocoblossom Special", price: 600, image: "https://images.unsplash.com/photo-1548811234-a2b16ac9892c?q=80&w=600&auto=format", description: "Zesty candied orange peels enrobed in smooth dark chocolate." },
    { id: 19, name: "Chocolate Thins In White", category: "Chocoblossom Special", price: 550, image: "https://images.unsplash.com/photo-1614088685112-0a760b7163c8?q=80&w=600&auto=format", description: "Sweet and creamy white chocolate wafers with a hint of vanilla." }
];

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
