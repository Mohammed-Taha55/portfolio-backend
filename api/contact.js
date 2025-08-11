const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const { name, email, message, botField } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ message: "Name required" });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) return res.status(400).json({ message: "Valid email required" });
  if (!message || message.length < 5) return res.status(400).json({ message: "Message too short" });

  if (botField) return res.status(400).json({ message: "Spam detected" });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.TO_EMAIL,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\nFrom: ${name} <${email}>`,
      html: `<p>${message.replace(/\n/g, "<br>")}</p><hr/><p>From: <strong>${name}</strong> &lt;${email}&gt;</p>`,
    });

    res.status(200).json({ message: "Message sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
