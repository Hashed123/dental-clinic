const path = require("path");
const Database = require("better-sqlite3");

// =========================================================
// مسار قاعدة البيانات
// =========================================================

const dbPath = path.join(__dirname, "clinic.db");

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");


// =========================================================
// إنشاء جدول المواعيد
// =========================================================

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


// =========================================================
// إضافة عمود الحالة إذا كانت قاعدة البيانات قديمة
// =========================================================

try {

    db.exec(`
        ALTER TABLE appointments
        ADD COLUMN status TEXT DEFAULT 'new'
    `);

} catch (error) {

    // إذا كان العمود موجودًا مسبقًا نتجاهل الخطأ

    if (!error.message.includes("duplicate column name")) {

        console.error(
            "Database migration error:",
            error.message
        );

    }

}


// =========================================================
// رسالة نجاح الاتصال
// =========================================================

console.log("Database connected successfully");


// =========================================================
// تصدير قاعدة البيانات
// =========================================================

module.exports = db;