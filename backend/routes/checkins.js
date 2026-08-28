const router = require("express").Router();
const db = require("../lib/db");
const { requireAuth } = require("./auth");

router.post("/", requireAuth(['trainee', 'admin']), (req, res) => {
  const { status, role, wageBand, usingSkill, selfEmployed } = req.body;
  let traineeId = req.user.id;
  
  if (req.user.role === 'admin') {
    const adminT = db.prepare("SELECT id FROM trainees LIMIT 1").get();
    if (!adminT) return res.status(404).json({ error: "Trainee not found" });
    traineeId = adminT.id;
  }
  
  const t = db.prepare("SELECT id, consent FROM trainees WHERE id = ?").get(traineeId);
  if (!t) return res.status(404).json({ error: "Trainee not found" });
  if (!t.consent) return res.status(403).json({ error: "Consent is required before a check-in can be stored." });
  if (!status || !wageBand) return res.status(400).json({ error: "Employment status and income range are required." });

  const date = new Date().toISOString().slice(0, 10);
  
  const stmt = db.prepare(`
    INSERT INTO checkins (traineeId, date, status, role, wageBand, usingSkill, selfEmployed) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const info = stmt.run(
    traineeId, 
    date, 
    status, 
    role || "", 
    wageBand, 
    Boolean(usingSkill) ? 1 : 0, 
    Boolean(selfEmployed) ? 1 : 0
  );

  res.status(201).json({
    id: info.lastInsertRowid,
    traineeId,
    date,
    status,
    role: role || "",
    wageBand,
    usingSkill: Boolean(usingSkill),
    selfEmployed: Boolean(selfEmployed)
  });
});

module.exports = router;
