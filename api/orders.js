// Vercel Serverless Function: /api/orders
// Handles Order Submission (Mock Persistence)

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

    if (req.method === 'POST') {
        try {
            const orderData = req.body;

            // Log for debugging (simulates saving to Database)
            console.log("📝 [Mock DB] Received Order:", JSON.stringify(orderData, null, 2));

            // Return success to Frontend so it shows "Order Placed"
            return res.status(200).json({
                message: "success",
                orderId: "ORDER-" + Date.now(), // Generate a mock ID
                status: "received"
            });
        } catch (error) {
            console.error("Order Save Error:", error);
            return res.status(500).json({ error: "Failed to save order" });
        }
    }

    // Default
    res.status(405).json({ error: "Method Not Allowed" });
}
