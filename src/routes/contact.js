// src/routes/contact.js
const express = require("express");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const buildTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: (process.env.EMAIL_SECURE === "true"),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// POST /api/contact
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("message").trim().isLength({ min: 5 }).withMessage("Message too short"),
    // optional honeypot: check req.body.botField === '' on frontend
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, message } = req.body;

    // Optional honeypot spam check:
    if (req.body.botField) {
      return res.status(400).json({ ok: false, message: "Spam detected" });
    }

    try {
      const transporter = buildTransporter();
      // optional: verify transporter in development (uncomment)
      // await transporter.verify();

      const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.TO_EMAIL,
        subject: `Portfolio message from ${name}`,
        text: `${message}\n\nFrom: ${name} <${email}>`,
        html: `<p>${message.replace(/\n/g, "<br>")}</p><hr/><p>From: <strong>${name}</strong> &lt;${email}&gt;</p>`,
      };

      await transporter.sendMail(mailOptions);
      return res.json({ ok: true, message: "Message sent" });
    } catch (err) {
      console.error("Mail error:", err);
      return res.status(500).json({ ok: false, message: "Failed to send message" });
    }
  }
);

module.exports = router;
