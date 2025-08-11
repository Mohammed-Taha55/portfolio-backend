module.exports = (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });
  res.status(200).json({ ok: true });
};
