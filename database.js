const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shop.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            price REAL,
            image TEXT,
            description TEXT
        )`);

        // Create Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT,
            customer_email TEXT,
            shipping_address TEXT, -- JSON string of address
            total_amount REAL,
            items TEXT, -- JSON string of items
            status TEXT DEFAULT 'pending',
            payment_status TEXT DEFAULT 'pending',
            payment_method TEXT,
            transaction_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migration: Attempt to add columns for existing databases
        // db.serialize ensures these run after table creation
        const migrationCols = [
            "ALTER TABLE orders ADD COLUMN shipping_address TEXT",
            "ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'",
            "ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'",
            "ALTER TABLE orders ADD COLUMN payment_method TEXT",
            "ALTER TABLE orders ADD COLUMN transaction_id TEXT"
        ];

        migrationCols.forEach(sql => {
            db.run(sql, (err) => {
                // Suppress "duplicate column" errors
                if (err && !err.message.includes("duplicate column")) {
                    console.error("Migration Warning (Safe to ignore):", err.message);
                }
            });
        });

        // Seed Data check
        db.get("SELECT count(*) as count FROM products", (err, row) => {
            if (row.count === 0) {
                console.log("Seeding products...");
                const products = [
                    {
                        name: "Classic Almond Truffles",
                        category: "Truffles",
                        price: 850,
                        image: "images/truffle1.jpg",
                        description: "Rich almond center encased in smooth milk chocolate."
                    },
                    {
                        name: "Cocoa Dust Truffles",
                        category: "Truffles",
                        price: 950,
                        image: "images/truffle2.jpg",
                        description: "Intense dark chocolate with a dusting of premium cocoa powder."
                    },
                    {
                        name: "Hazelnut Truffle Box",
                        category: "Truffles",
                        price: 1200,
                        image: "images/truffle3.jpg",
                        description: "Crunchy hazelnuts paired with creamy truffle filling."
                    },
                    {
                        name: "Coconut Truffle Selection",
                        category: "Truffles",
                        price: 750,
                        image: "images/truffle4.jpg",
                        description: "Exotic coconut flavor wrapped in Belgian chocolate."
                    },
                    {
                        name: "Assorted Nut Truffles",
                        category: "Truffles",
                        price: 1100,
                        image: "images/truffle5.jpg",
                        description: "A nutty delight featuring almonds, cashews, and pistachios."
                    },
                    // Bars Collection
                    // Bars Collection
                    {
                        name: "Candied Orange Bar",
                        category: "Bars",
                        price: 450,
                        image: "images/bar_candied_orange.jpg",
                        description: "Dark chocolate infused with zesty candied orange peel."
                    },
                    {
                        name: "Crunchy Hazelnut Bar",
                        category: "Bars",
                        price: 480,
                        image: "images/bar_crunchy_hazelnut.jpg",
                        description: "Packed with roasted hazelnuts for a satisfying crunch."
                    },
                    {
                        name: "Fruits & Nuts Bar",
                        category: "Bars",
                        price: 500,
                        image: "images/bar_fruits_nuts.jpg",
                        description: "A classic combination of raisins, cashews, and almonds."
                    },
                    {
                        name: "Roasted Almond Bar",
                        category: "Bars",
                        price: 480,
                        image: "images/bar_roasted_almond.jpg",
                        description: "Golden roasted almonds embedded in rich milk chocolate."
                    },
                    {
                        name: "Pistachio Cranberry Bar",
                        category: "Bars",
                        price: 550,
                        image: "images/bar_pistachio_cranberry.jpg",
                        description: "Tangy cranberries meet premium pistachios in white chocolate."
                    },
                    {
                        name: "Handcrafted Pecan Bar",
                        category: "Bars",
                        price: 600,
                        image: "images/bar_pecan.jpg",
                        description: "Buttery pecans with caramel notes in artisan chocolate."
                    },
                    {
                        name: "Pistachio Kunafa Bar",
                        category: "Bars",
                        price: 750,
                        image: "images/bar_kunafa.jpg",
                        description: "Viral sensation! Crunchy kunafa pastry with pistachio cream."
                    },
                    // --- Chocoblossom Special (7 Items) ---
                    {
                        name: "English Brittle",
                        price: 650,
                        category: "Chocoblossom Special",
                        image: "images/english_brittle.jpg",
                        description: "Classic crunchy caramelized sugar with embedded roasted nuts."
                    },
                    {
                        name: "Chocolate Thins In Milk",
                        price: 550,
                        category: "Chocoblossom Special",
                        image: "images/thins_milk.jpg",
                        description: "Delicate, wafer-thin sheets of creamy milk chocolate that melt on the tongue."
                    },
                    {
                        name: "Almond Florentine",
                        price: 700,
                        category: "Chocoblossom Special",
                        image: "images/almond_florentine.jpg",
                        description: "Crispy almond discs coated in caramel and dipped in chocolate."
                    },
                    {
                        name: "Chocolate Thins In Dark",
                        price: 550,
                        category: "Chocoblossom Special",
                        image: "images/thins_dark.jpg",
                        description: "Intense 70% dark chocolate wafers for the true cocoa connoisseur."
                    },
                    {
                        name: "Almond Roca",
                        price: 750,
                        category: "Chocoblossom Special",
                        image: "images/almond_roca.jpg",
                        description: "Buttercrunch toffee with almonds, covered in chocolate and almond dust."
                    },
                    {
                        name: "Chocolate Coated Orange Peel",
                        price: 600,
                        category: "Chocoblossom Special",
                        image: "https://images.unsplash.com/photo-1548811234-a2b16ac9892c?q=80&w=600&auto=format",
                        description: "Zesty candied orange peels enrobed in smooth dark chocolate."
                    },
                    {
                        name: "Chocolate Thins In White",
                        price: 550,
                        category: "Chocoblossom Special",
                        image: "https://images.unsplash.com/photo-1614088685112-0a760b7163c8?q=80&w=600&auto=format",
                        description: "Sweet and creamy white chocolate wafers with a hint of vanilla."
                    }
                ];

                const stmt = db.prepare("INSERT INTO products (name, category, price, image, description) VALUES (?, ?, ?, ?, ?)");
                products.forEach(p => {
                    stmt.run(p.name, p.category, p.price, p.image, p.description);
                });
                stmt.finalize();
                console.log("Products seeded successfully.");
            }
        });
    });
}

module.exports = db;
