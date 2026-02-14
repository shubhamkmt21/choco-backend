// Vercel Serverless Function: /api/razorpay
// Handles BOTH Order Creation and Payment Verification

const Razorpay = require("razorpay");
const crypto = require("crypto");

// ENV variables or Fallback (Use Vercel Environment Variables in Production!)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_live_Qg11jTM5s0KRbh";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "5XwoEMtB1t66TcbrmNrj5N10";

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // --- ACTION 1: CREATE ORDER ---
    if (req.method === 'POST' && req.body.action === 'create_order') {
        try {
            const { amount, currency = "INR" } = req.body;

            if (!amount) {
                return res.status(400).json({ error: "Amount is required" });
            }

            const options = {
                amount: amount * 100, // Paise
                currency: currency,
                receipt: "order_rcptid_" + Date.now(),
            };

            const order = await razorpay.orders.create(options);
            return res.status(200).json(order);
        } catch (error) {
            console.error("Razorpay Create Error:", error);
            return res.status(500).json({ error: "Order Creation Failed" });
        }
    }

    // --- ACTION 2: VERIFY PAYMENT ---
    if (req.method === 'POST' && req.body.action === 'verify_payment') {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const expectedSignature = crypto
                .createHmac("sha256", RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature === razorpay_signature) {
                // In a real app, you would save to DB here.
                // For Serverless, we just verify and return success.
                // You can add a webhook later for reliable DB saving.
                return res.status(200).json({ status: "success", message: "Payment verified" });
            } else {
                return res.status(400).json({ status: "failure", message: "Invalid signature" });
            }
        } catch (error) {
            console.error("Verification Error:", error);
            return res.status(500).json({ error: "Verification Failed" });
        }
    }

    // Default
    res.status(400).json({ error: "Invalid Action or Method" });
}
