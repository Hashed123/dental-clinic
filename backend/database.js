const Database = require("better-sqlite3");

const db = new Database("clinic.db");

db.pragma("foreign_keys = ON");


/* =========================================================
   إنشاء جدول المواعيد
========================================================= */

db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        date TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);


/* =========================================================
   إضافة عمود الحالة إذا كانت قاعدة البيانات قديمة
========================================================= */

try {

    db.exec(`
        ALTER TABLE appointments
        ADD COLUMN status TEXT DEFAULT 'new'
    `);

} catch (error) {

    /*
       إذا كان العمود موجودًا مسبقًا
       نتجاهل الخطأ
    */

    if (!error.message.includes("duplicate column name")) {

        console.error(
            "Database migration error:",
            error.message
        );

    }

}


console.log("Database connected successfully");


module.exports = db;

