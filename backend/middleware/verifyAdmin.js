require("dotenv").config({ path: "/etc/secrets/.env" }); // Use Render secret file path

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No admin token provided" });
  }
  // Expect header format: "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ message: "Invalid admin token" });
  }
  next();
};

module.exports = verifyAdmin;
