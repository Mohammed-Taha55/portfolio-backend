// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


const contactRoute = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);

// basic rate limiting to reduce spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// routesconsole.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);

app.use("/api/contact", contactRoute);

// health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
