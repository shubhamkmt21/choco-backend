
// Centralized Product Data with Ingredients
// Used for fallback and Product Detail Page
const PRODUCTS_DATA = [

    {
        id: 103,
        name: "Chocolate Drenched",
        category: "Cookies",
        price: 550,
        image: "images/chocolate_drenched_new.jpg?v=2",
        description: "A decadent treat featuring crisp cookies completely drenched in our signature premium chocolate. Choose your favorite nut pairing for the perfect crunch.",
        ingredients: "Wheat Flour, Butter, Sugar, Cocoa Mass, Cocoa Butter, Milk Solids, Assorted Nuts (Almond/Hazelnut/Pistachio).",
        // Flavors removed as per request
        images: [
            "images/chocolate_drenched_new.jpg?v=2",
            "images/chocolate_drenched_main.jpg",
            "images/chocolate_drenched_group.jpg",
            "images/chocolate_drenched_back.jpg"
        ]
    },
    {
        id: 104,
        name: "Chocolate Drenched - Chocolate",
        category: "Cookies",
        price: 280,
        image: "images/choco_drenched_choc_1.jpg?v=1",
        description: "Double the chocolate, double the delight. Our signature chocolate cookie drowned in a thick layer of premium cocoa coating.",
        ingredients: "Wheat Flour, Cocoa Powder, Butter, Sugar, Cocoa Mass, Cocoa Butter, Milk Solids.",
        images: [
            "images/choco_drenched_choc_1.jpg?v=1",
            "images/chocolate_drenched_choc_2_new.jpg",
            "images/chocolate_drenched_choc_3_new.jpg"
        ]
    },
    {
        id: 105,
        name: "Chocolate Drenched - Hazelnut",
        category: "Cookies",
        price: 280,
        image: "images/choco_drenched_hazelnut_1.jpg?v=2",
        description: "Experience the perfect crunch of roasted hazelnuts combined with our signature chocolate-drenched cookie.",
        ingredients: "Wheat Flour, Roasted Hazelnuts, Cocoa Powder, Butter, Sugar, Cocoa Mass, Cocoa Butter, Milk Solids.",
        images: [
            "images/choco_drenched_hazelnut_1.jpg?v=2",
            "images/choco_drenched_hazelnut_2.jpg?v=2",
            "images/choco_drenched_hazelnut_3.jpg?v=1"
        ]
    },
    {
        id: 106,
        name: "Chocolate Drenched - Pistachio",
        category: "Cookies",
        price: 280,
        image: "images/choco_drenched_pistachio_1.jpg?v=1",
        description: "Savor the rich taste of premium pistachios generously embedded in our signature chocolate-drenched cookies.",
        ingredients: "Wheat Flour, Pistachios, Cocoa Powder, Butter, Sugar, Cocoa Mass, Cocoa Butter, Milk Solids.",
        images: [
            "images/choco_drenched_pistachio_1.jpg?v=1",
            "images/choco_drenched_pistachio_2.jpg?v=1",
            "images/choco_drenched_pistachio_3.jpg?v=1"
        ]
    },
    {
        id: 107,
        name: "Almond Rocca",
        category: "Rocca and Florentine",
        price: 650,
        image: "images/almond_rocca_3.png?v=2",
        description: "Crunchy butter toffee logs rolled in roasted almonds and coated in premium chocolate. A classic confection perfected.",
        ingredients: "Butter, Sugar, Roasted Almonds, Cocoa Mass, Cocoa Butter, Milk Solids, Salt, Vanilla.",
        images: [
            "images/almond_rocca_3.png?v=2",
            "images/almond_rocca_2.jpg?v=1",
            "images/almond_rocca_1.png?v=2"
        ]
    },
    {
        id: 108,
        name: "Hazelnut Rocca",
        category: "Rocca and Florentine",
        price: 650,
        image: "images/hazelnut_rocca_1.png?v=1",
        description: "Classic butter crunch toffee coated with premium chocolate and dusted with roasted crushed hazelnuts.",
        ingredients: "Butter, Sugar, Roasted Hazelnuts, Cocoa Mass, Cocoa Butter, Milk Solids, Salt, Vanilla.",
        images: [
            "images/hazelnut_rocca_1.png?v=1",
            "images/hazelnut_rocca_2.png?v=1",
            "images/hazelnut_rocca_3.png?v=1"
        ]
    },
    {
        id: 109,
        name: "Pistachio Rocca",
        category: "Rocca and Florentine",
        price: 650,
        image: "images/pistachio_rocca_1.jpg?v=1",
        description: "Exquisite butter toffee logs enriched with premium roasted pistachios, coated in rich dark chocolate. A luxurious nutty delight.",
        ingredients: "Butter, Sugar, Roasted Pistachios, Cocoa Mass, Cocoa Butter, Milk Solids, Salt, Vanilla.",
        images: [
            "images/pistachio_rocca_1.jpg?v=1",
            "images/pistachio_rocca_2.jpg?v=1",
            "images/pistachio_rocca_3.png?v=1"
        ]
    },
    {
        id: 110,
        name: "Valentine's Gift Box",
        category: "Valentines",
        price: 400,
        image: "images/valentines_box_1.jpg?v=1",
        description: "Celebrate love with our exclusive Valentine's Gift Box. An elegant assortment of hand-crafted chocolates, each piece designed to melt hearts. The perfect gesture for your special someone.",
        ingredients: "Premium Cocoa, Sugar, Butter, Cocoa Butter, Milk Solids, Assorted Fillings (Nuts, Ganache, Caramel).",
        images: [
            "images/valentines_box_1.jpg?v=1",
            "images/valentines_box_2.jpg?v=1",
            "images/valentines_box_3.jpg?v=1"
        ]
    },

    {
        id: 1,
        name: "Classic Almond Truffles",
        category: "Truffles",
        price: 850,
        image: "images/truffle1.jpg",
        description: "Rich almond center encased in smooth milk chocolate.",
        ingredients: "Milk Chocolate (Sugar, Cocoa Butter, Whole Milk Powder, Cocoa Mass), Roasted Almonds (25%), Heavy Cream, Glucose Syrup, Vanilla Extract."
    },
    {
        id: 2,
        name: "Cocoa Dust Truffles",
        category: "Truffles",
        price: 950,
        image: "images/truffle2.jpg",
        description: "Intense dark chocolate with a dusting of premium cocoa powder.",
        ingredients: "Dark Chocolate (70% Cocoa Solids), Cocoa Powder, Heavy Cream, Butter, Natural Vanilla Flavouring."
    },
    {
        id: 3,
        name: "Hazelnut Truffle Box",
        category: "Truffles",
        price: 1200,
        image: "images/truffle3.jpg",
        description: "Crunchy hazelnuts paired with creamy truffle filling.",
        ingredients: "Milk Chocolate, Roasted Hazelnuts (30%), Hazelnut Paste, Cocoa Butter, Skimmed Milk Powder, Sugar."
    },
    {
        id: 4,
        name: "Coconut Truffle Selection",
        category: "Truffles",
        price: 750,
        image: "images/truffle4.jpg",
        description: "Exotic coconut flavor wrapped in Belgian chocolate.",
        ingredients: "White Chocolate, Desiccated Coconut, Coconut Milk, Glucose, Sugar, Vanilla Bean Paste."
    },
    {
        id: 5,
        name: "Assorted Nut Truffles",
        category: "Truffles",
        price: 1100,
        image: "images/truffle5.jpg",
        description: "A nutty delight featuring almonds, cashews, and pistachios.",
        ingredients: "Assorted Chocolate (Milk, Dark, White), Almonds, Cashews, Pistachios, Cream, Butter."
    },
    {
        id: 6,
        name: "Candied Orange Bar",
        category: "Bars",
        price: 450,
        image: "images/bar_candied_orange.jpg",
        description: "Dark chocolate infused with zesty candied orange peel.",
        ingredients: "Dark Chocolate (60% Cocoa), Candied Orange Peel (Orange Peel, Sugar, Glucose Syrup), Orange Oil."
    },
    {
        id: 7,
        name: "Crunchy Hazelnut Bar",
        category: "Bars",
        price: 480,
        image: "images/bar_crunchy_hazelnut.jpg",
        description: "Packed with roasted hazelnuts for a satisfying crunch.",
        ingredients: "Milk Chocolate, Chopped Roasted Hazelnuts, Rice Crisps, Cocoa Butter, Soy Lecithin."
    },
    {
        id: 8,
        name: "Fruits & Nuts Bar",
        category: "Bars",
        price: 500,
        image: "images/bar_fruits_nuts.jpg",
        description: "A classic combination of raisins, cashews, and almonds.",
        ingredients: "Milk Chocolate, California Raisins, Roasted Cashews, Roasted Almonds, Vanilla Extract."
    },
    {
        id: 9,
        name: "Roasted Almond Bar",
        category: "Bars",
        price: 480,
        image: "images/bar_roasted_almond.jpg",
        description: "Golden roasted almonds embedded in rich milk chocolate.",
        ingredients: "Milk Chocolate, Whole Roasted Almonds, Cocoa Butter, Milk Solids, Sea Salt."
    },
    {
        id: 10,
        name: "Pistachio Cranberry Bar",
        category: "Bars",
        price: 550,
        image: "images/bar_pistachio_cranberry.jpg",
        description: "Tangy cranberries meet premium pistachios in white chocolate.",
        ingredients: "White Chocolate, Dried Cranberries, Roasted Pistachios, Cocoa Butter, Milk Powder."
    },
    {
        id: 11,
        name: "Handcrafted Pecan Bar",
        category: "Bars",
        price: 600,
        image: "images/bar_pecan.jpg",
        description: "Buttery pecans with caramel notes in artisan chocolate.",
        ingredients: "Milk Chocolate, Pecan Nuts, Caramel Pieces, Sea Salt, Natural Caramel Flavor."
    },
    {
        id: 12,
        name: "Pistachio Kunafa Bar",
        category: "Bars",
        price: 750,
        image: "images/bar_kunafa.jpg",
        description: "Viral sensation! Crunchy kunafa pastry with pistachio cream.",
        ingredients: "Milk Chocolate, Kataifi Pastry (Wheat Flour, Water), Pistachio Cream (Pistachios, Sugar, Oil), Butter."
    },

];

// Helper to find product by ID
function findProductById(id) {
    return PRODUCTS_DATA.find(p => p.id == id);
}

// Global Export
window.PRODUCTS_DATA = PRODUCTS_DATA;
window.findProductById = findProductById;
