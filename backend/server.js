const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./database");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Dental Clinic API is working!",
        status: "success"
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "تم الاتصال بالـ Backend بنجاح"
    });
});


// ===============================
// إضافة موعد جديد


app.post("/api/appointments", (req, res) => {
    const { name, phone, service, date, message } = req.body;

    // التحقق من البيانات الأساسية
    if (!name || !phone || !service || !date) {
        return res.status(400).json({
            success: false,
            message: "يرجى تعبئة جميع الحقول المطلوبة"
        });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO appointments
            (name, phone, service, date, message)
            VALUES (?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            name,
            phone,
            service,
            date,
            message || ""
        );

        res.status(201).json({
            success: true,
            message: "تم حجز الموعد بنجاح",
            appointmentId: result.lastInsertRowid
        });

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء حفظ الموعد"
        });
    }
});
app.get("/api/appointments", (req, res) => {

    try {

        const appointments = db.prepare(`
            SELECT *
            FROM appointments
            ORDER BY id ASC
        `).all();

        res.json({
            success: true,
            appointments: appointments
        });

    } catch (error) {

        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء جلب المواعيد"
        });

    }

 
});
app.patch("/api/appointments/:id/status", (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
        "new",
        "confirmed",
        "completed",
        "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            success: false,
            message: "حالة الموعد غير صحيحة"
        });

    }

    try {

        const stmt = db.prepare(`
            UPDATE appointments
            SET status = ?
            WHERE id = ?
        `);

        const result = stmt.run(status, id);

        if (result.changes === 0) {

            return res.status(404).json({
                success: false,
                message: "الموعد غير موجود"
            });

        }

        res.json({
            success: true,
            message: "تم تحديث حالة الموعد بنجاح"
        });

    } catch (error) {

        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء تحديث الموعد"
        });

    }

});
// Delete appointment

app.delete("/api/appointments/:id", (req, res) => {

    const { id } = req.params;

    try {

        const stmt = db.prepare(`
            DELETE FROM appointments
            WHERE id = ?
        `);

        const result = stmt.run(id);

        if (result.changes === 0) {

            return res.status(404).json({
                success: false,
                message: "الموعد غير موجود"
            });

        }

        res.json({
            success: true,
            message: "تم حذف الموعد بنجاح"
        });

    } catch (error) {

        console.error("Delete error:", error);

        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء حذف الموعد"
        });

    }

});
// Admin Login

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {

        return res.status(400).json({
            success: false,
            message: "يرجى إدخال اسم المستخدم وكلمة المرور"
        });

    }

    const adminUsername =
        process.env.ADMIN_USERNAME;

    const adminPassword =
        process.env.ADMIN_PASSWORD;

    if (
        username === adminUsername &&
        password === adminPassword
    ) {

        return res.json({
            success: true,
            message: "تم تسجيل الدخول بنجاح"
        });

    }

    res.status(401).json({
        success: false,
        message: "اسم المستخدم أو كلمة المرور غير صحيحة"
    });

});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

