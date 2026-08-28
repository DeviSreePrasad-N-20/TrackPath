const router = require("express").Router();
const db = require("../lib/db");
const { requireAuth } = require("./auth");

router.get("/", requireAuth(['employer', 'admin']), (req, res) => {
  const trainees = db.prepare("SELECT id, outcomeId, name, schemeId, cohort, consent FROM trainees").all();
  res.json(trainees.map(t => ({...t, consent: Boolean(t.consent)})));
});

router.get("/me", requireAuth(['trainee', 'admin']), (req, res) => {
  let t;
  if (req.user.role === 'admin') {
    t = db.prepare("SELECT * FROM trainees LIMIT 1").get();
  } else {
    t = db.prepare("SELECT * FROM trainees WHERE id = ?").get(req.user.id);
  }
  if (!t) return res.status(404).json({ error: "Trainee not found" });
  
  t.consent = Boolean(t.consent);
  
  const checks = db.prepare("SELECT * FROM checkins WHERE traineeId = ?").all(t.id);
  checks.forEach(c => {
    c.usingSkill = Boolean(c.usingSkill);
    c.selfEmployed = Boolean(c.selfEmployed);
  });
  
  res.json({ ...t, checkins: checks });
});

router.patch("/me/consent", requireAuth(['trainee', 'admin']), (req, res) => {
  let tId = req.user.id;
  if (req.user.role === 'admin') {
    const t = db.prepare("SELECT id FROM trainees LIMIT 1").get();
    if (!t) return res.status(404).json({ error: "Trainee not found" });
    tId = t.id;
  }
  const t = db.prepare("SELECT id, consent FROM trainees WHERE id = ?").get(tId);
  if (!t) return res.status(404).json({ error: "Trainee not found" });
  
  const newConsent = Boolean(req.body.consent) ? 1 : 0;
  db.prepare("UPDATE trainees SET consent = ? WHERE id = ?").run(newConsent, tId);
  
  res.json({ id: t.id, consent: Boolean(newConsent) });
});

module.exports = router;
