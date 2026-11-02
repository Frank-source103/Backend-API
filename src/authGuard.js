const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

// Hash both sides first so the comparison always takes the same time
const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

authRouter.post("/login", (req, res) => {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
    return res
      .status(500)
      .json({ success: false, message: "Server login is not configured" });
  }

  const { username, password } = req.body || {};
  const okUser = safeEqual(username ?? "", ADMIN_USERNAME);
  const okPass = safeEqual(password ?? "", ADMIN_PASSWORD);
  if (!okUser || !okPass) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid username or password" });
  }

  const token = jwt.sign({ role: "lecturer", username: ADMIN_USERNAME }, JWT_SECRET, {
    expiresIn: "8h",
  });
  res.json({ success: true, token, role: "lecturer" });
});

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: "Login required" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Session expired. Please log in again." });
  }
}

// Anyone can READ; only logged-in lecturers can WRITE
function guardWrites(req, res, next) {
  if (
    req.path.startsWith("/auth") ||
    ["GET", "HEAD", "OPTIONS"].includes(req.method)
  ) {
    return next();
  }
  return requireAuth(req, res, next);
}

module.exports = { authRouter, requireAuth, guardWrites };
