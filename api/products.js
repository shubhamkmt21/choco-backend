// Vercel Serverless Function: /api/products
// Serves static product data (replacing SQLite for cloud stability)

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
];

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');

    const { category, priceRange } = req.query;
    let result = products;

    if (category && category !== "All Products") {
        result = result.filter(p => p.category === category);
    }

    if (priceRange) {
        if (priceRange === "Under ₹500") {
            result = result.filter(p => p.price < 500);
        } else if (priceRange === "₹500 - ₹1000") {
            result = result.filter(p => p.price >= 500 && p.price <= 1000);
        } else if (priceRange === "₹1000 - ₹2000") {
            result = result.filter(p => p.price >= 1000 && p.price <= 2000);
        } else if (priceRange === "Above ₹2000") {
            result = result.filter(p => p.price > 2000);
        }
    }

    res.status(200).json({
        message: "success",
        data: result
    });
}
