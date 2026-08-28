const router = require("express").Router();
const db = require("../lib/db");
const { requireAuth } = require("./auth");
const { employed } = require("../services/outcomeService");

// Re-using the same dashboard logic minimally for AI insight
router.post("/guide", (req, res) => {
  const { path } = req.body;
  
  let responseText = "I'm your AI assistant. I'm here to help you navigate TrackPath.";

  if (path === "/" || path === "/login") {
    responseText = "Welcome to TrackPath! This platform securely tracks career outcomes.\n\nDemo Accounts:\n- Trainee: trainee_demo / demo123\n- Employer: employer_demo / demo123\n- Admin (Role select + Password): admin123";
  } 
  else if (path.includes("/trainee")) {
    responseText = "Hello! Your privacy is our top priority. By updating your employment status, you help training programmes secure funding and improve their curriculum. Your specific details are never shared publicly without your explicit consent.";
  }
  else if (path.includes("/employer")) {
    responseText = "Hi! Thank you for validating your employee's tenure. This takes less than a minute and helps prove the real-world value of skilling initiatives.";
  }
  else if (path.includes("/admin")) {
    // Simulated AI Backend Intelligence
    const trainees = db.prepare("SELECT * FROM trainees WHERE consent = 1").all();
    const checks = db.prepare("SELECT * FROM checkins").all();
    
    const latest = (t) => checks.filter((c) => c.traineeId === t.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    const latests = trainees.map((t) => ({ t, c: latest(t) })).filter((x) => x.c);
    
    const placementRate = latests.length ? Math.round((latests.filter(x => employed(x.c.status)).length / latests.length) * 100) : 0;
    const selfEmployment = latests.length ? Math.round((latests.filter(x => x.c.selfEmployed === 1).length / latests.length) * 100) : 0;

    let insights = [];
    
    if (placementRate < 50) {
      insights.push(`Overall placement across the platform is currently low (${placementRate}%). You may need to engage more industry partners or review the recent skill-gap heatmap.`);
    } else {
      insights.push(`Your overall placement rate is strong at ${placementRate}%. Great job!`);
    }
    
    if (selfEmployment > 15) {
      insights.push(`I noticed that ${selfEmployment}% of your placed trainees are self-employed. You might want to offer micro-loans or entrepreneurship support tailored for them.`);
    }
    
    responseText = "Here is my analysis of the dashboard:\n\n" + insights.join(" ") + "\n\nDon't forget to check the 'Action Required' panel at the bottom to send follow-up reminders!";
  }

  res.json({ message: responseText });
});

module.exports = router;
