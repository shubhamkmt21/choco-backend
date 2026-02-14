const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shop.db');

db.all("SELECT count(*) as count FROM products", [], (err, rows) => {
    if (err) {
        console.error("DB Error:", err);
        return;
    }
    console.log("Total Products in DB:", rows[0].count);

    // Also check categories
    db.all("SELECT category, count(*) as c FROM products GROUP BY category", [], (err, cats) => {
        console.log("Categories:", cats);
    });
});
