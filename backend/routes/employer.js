const router = require("express").Router();
const db = require("../lib/db");
const { requireAuth } = require("./auth");

router.post("/validate", requireAuth(['employer', 'admin']), (req, res) => {
  const { traineeId, employerName, status, tenure, wageBand } = req.body;
  
  const t = db.prepare("SELECT id, consent FROM trainees WHERE id = ?").get(traineeId);
  if (!t) return res.status(404).json({ error: "Trainee not found" });
  if (!t.consent) return res.status(403).json({ error: "Consent is required." });
  if (!employerName || !status) return res.status(400).json({ error: "Missing required fields." });

  const date = new Date().toISOString().slice(0, 10);
  
  const stmt = db.prepare(`
    INSERT INTO employer_validations (traineeId, employerName, date, status, tenure, wageBand)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const info = stmt.run(traineeId, employerName, date, status, tenure, wageBand);

  res.status(201).json({
    id: info.lastInsertRowid,
    traineeId,
    employerName,
    date,
    status,
    tenure,
    wageBand
  });
});

router.post("/bulk-validate", requireAuth(['employer', 'admin']), (req, res) => {
  const { validations } = req.body;
  if (!validations || !Array.isArray(validations)) {
    return res.status(400).json({ error: "Invalid payload format" });
  }

  const date = new Date().toISOString().slice(0, 10);
  const stmt = db.prepare(`
    INSERT INTO employer_validations (traineeId, employerName, date, status, tenure, wageBand)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  db.transaction(() => {
    for (const v of validations) {
      const t = db.prepare("SELECT id, consent FROM trainees WHERE id = ?").get(v.traineeId);
      if (t && t.consent) {
        stmt.run(v.traineeId, req.user.name, date, v.status || 'employed', v.tenure || 'Less than 3 months', v.wageBand || 'Below ₹10k');
        count++;
      }
    }
  })();

  res.status(201).json({ message: `Successfully validated ${count} records.` });
});

module.exports = router;
