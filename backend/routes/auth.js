const router = require("express").Router();
const db = require("../lib/db");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "trackpath-super-secret-key-for-mvp";

// Unified login endpoint
router.post("/login", (req, res) => {
  const { role, loginId, password } = req.body;
  
  if (role === 'admin') {
    if (password === 'admin123') {
      const token = jwt.sign({ role: 'admin', name: 'Amit Patel' }, SECRET, { expiresIn: '1d' });
      return res.json({ token, role: 'admin', user: { name: 'Amit Patel', role: 'admin' } });
    }
    return res.status(401).json({ error: "Invalid admin credentials" });
  } 
  
  if (role === 'employer') {
    // loginId is username
    const emp = db.prepare("SELECT * FROM employers WHERE username = ?").get(loginId);
    if (emp && emp.password === password) {
      const token = jwt.sign({ role: 'employer', id: emp.id, name: emp.name }, SECRET, { expiresIn: '1d' });
      return res.json({ token, role: 'employer', user: { name: emp.name } });
    }
    return res.status(401).json({ error: "Invalid employer credentials" });
  }

  if (role === 'trainee') {
    // loginId is username
    const trainee = db.prepare("SELECT * FROM trainees WHERE username = ?").get(loginId);
    if (trainee && trainee.password === password) {
      const token = jwt.sign({ role: 'trainee', id: trainee.id, name: trainee.name }, SECRET, { expiresIn: '1d' });
      return res.json({ token, role: 'trainee', user: { name: trainee.name, id: trainee.id } });
    }
    return res.status(401).json({ error: "Invalid trainee credentials" });
  }

  res.status(400).json({ error: "Invalid role specified" });
});

// Auth middleware factory
const requireAuth = (allowedRoles = []) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing authentication session" });
  }
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, SECRET);
    if (allowedRoles.length && !allowedRoles.includes(decoded.role) && decoded.role !== 'admin') {
      return res.status(403).json({ error: `Forbidden: requires one of [${allowedRoles.join(', ')}] role` });
    }
    req.user = decoded; // { role, id, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session token" });
  }
};

module.exports = { router, requireAuth, SECRET };
