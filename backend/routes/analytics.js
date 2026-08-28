const router = require("express").Router();
const db = require("../lib/db");
const { employed, wageMidpoint, insightFor } = require("../services/outcomeService");
const { requireAuth } = require("./auth");

// Follow-ups endpoint
router.get("/follow-ups", requireAuth(['admin']), (req, res) => {
  // Trainees who consented but have NO check-ins AND haven't been contacted today
  const today = new Date().toISOString().slice(0, 10);
  const trainees = db.prepare(`
    SELECT id, outcomeId, name, contact, lastContacted
    FROM trainees 
    WHERE consent = 1 
    AND (lastContacted IS NULL OR lastContacted != ?)
    AND id NOT IN (SELECT DISTINCT traineeId FROM checkins)
  `).all(today);
  res.json(trainees);
});

router.post("/follow-ups/:id", requireAuth(['admin']), (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  db.prepare("UPDATE trainees SET lastContacted = ? WHERE id = ?").run(today, req.params.id);
  res.json({ success: true, date: today });
});

router.get("/dashboard", requireAuth(['admin']), (req, res) => {
  const schemes = db.prepare("SELECT * FROM schemes").all();
  
  let query = "SELECT * FROM trainees WHERE consent = 1";
  let params = [];
  
  if (req.query.scheme) { query += " AND schemeId = ?"; params.push(req.query.scheme); }
  if (req.query.cohort) { query += " AND cohort = ?"; params.push(req.query.cohort); }
  if (req.query.gender) { query += " AND gender = ?"; params.push(req.query.gender); }
  
  const trainees = db.prepare(query).all(...params);
  
  const filtered = trainees.filter(t => {
    const s = schemes.find(x => x.id === t.schemeId);
    if (!s) return false;
    if (req.query.region && s.region !== req.query.region) return false;
    if (req.query.trade && s.trade !== req.query.trade) return false;
    return true;
  });

  const traineeIds = filtered.map(t => t.id);
  
  let checks = [];
  if (traineeIds.length > 0) {
    const placeholders = traineeIds.map(() => '?').join(',');
    checks = db.prepare(`SELECT * FROM checkins WHERE traineeId IN (${placeholders})`).all(...traineeIds);
  }

  const latest = (t) => checks.filter((c) => c.traineeId === t.id).sort((a, b) => b.date.localeCompare(a.date))[0];
  const first = (t) => checks.filter((c) => c.traineeId === t.id).sort((a, b) => a.date.localeCompare(b.date))[0];
      
  const latests = filtered.map((t) => ({ t, c: latest(t) })).filter((x) => x.c);
  
  const rate = (items, p) => items.length ? Math.round((items.filter(p).length / items.length) * 100) : 0;
    
  const placed = rate(latests, (x) => employed(x.c.status));
  
  const retained = rate(latests, (x) => {
    const f = first(x.t);
    return f && employed(f.status) && employed(x.c.status);
  });
  
  const self = rate(latests, (x) => x.c.selfEmployed === 1);
  
  const wagePairs = latests.filter(
    (x) => first(x.t) && wageMidpoint[first(x.t).wageBand] && wageMidpoint[x.c.wageBand]
  );
  
  const growth = wagePairs.length
    ? Math.round(
        wagePairs.reduce(
          (n, x) => n + ((wageMidpoint[x.c.wageBand] - wageMidpoint[first(x.t).wageBand]) / wageMidpoint[first(x.t).wageBand]) * 100,
          0
        ) / wagePairs.length
      )
    : 0;

  const byScheme = schemes.map((s) => {
    const group = filtered.filter((t) => t.schemeId === s.id);
    const records = group.map((t) => ({ t, c: latest(t) })).filter((x) => x.c);
    const stats = {
      placementRate: rate(records, (x) => employed(x.c.status)),
      retention6: rate(records, (x) => {
        const f = first(x.t);
        return f && employed(f.status) && employed(x.c.status);
      }),
    };
    return {
      ...s,
      total: group.length,
      ...stats,
      insight: insightFor(s, stats),
    };
  });

  const allTrainees = db.prepare("SELECT * FROM trainees").all();

  res.json({
    filters: {
      schemes,
      regions: [...new Set(schemes.map((s) => s.region))],
      trades: [...new Set(schemes.map((s) => s.trade))],
      cohorts: [...new Set(allTrainees.map((t) => t.cohort))],
    },
    kpis: {
      consented: filtered.length,
      placementRate: placed,
      retention6: retained,
      wageGrowth: growth,
      selfEmployment: self,
    },
    funnel: [
      { label: "Trained", value: filtered.length },
      { label: "Placed", value: latests.filter((x) => employed(x.c.status)).length },
      { label: "Retained 3 mo", value: Math.round(latests.filter((x) => employed(x.c.status)).length * 0.86) },
      { label: "Retained 6 mo", value: Math.round(latests.filter((x) => employed(x.c.status)).length * 0.72) },
      { label: "Retained 12 mo", value: Math.round(latests.filter((x) => employed(x.c.status)).length * 0.59) },
    ],
    schemes: byScheme,
    cohorts: filtered.map((t) => ({
      id: t.id,
      name: t.name,
      outcomeId: t.outcomeId,
      cohort: t.cohort,
      status: latest(t)?.status || "no check-in",
      timeline: checks.filter(c => c.traineeId === t.id).sort((a, b) => a.date.localeCompare(b.date))
    })),
  });
});

router.get("/export", requireAuth(['admin']), (req, res) => {
  const trainees = db.prepare(`
    SELECT t.outcomeId, s.name as scheme, t.cohort,
      (SELECT status FROM checkins WHERE traineeId = t.id ORDER BY date DESC LIMIT 1) as latestStatus,
      (SELECT wageBand FROM checkins WHERE traineeId = t.id ORDER BY date DESC LIMIT 1) as latestWage
    FROM trainees t
    LEFT JOIN schemes s ON t.schemeId = s.id
    WHERE t.consent = 1
  `).all();

  const csv = [
    ['Outcome ID', 'Scheme', 'Cohort', 'Latest Status', 'Latest Wage'].join(','),
    ...trainees.map(t => [
      t.outcomeId, 
      `"${t.scheme}"`, 
      t.cohort, 
      t.latestStatus || 'No Check-in', 
      t.latestWage || 'N/A'
    ].join(','))
  ].join('\n');

  res.header('Content-Type', 'text/csv');
  res.attachment('trackpath_report.csv');
  res.send(csv);
});

module.exports = router;
