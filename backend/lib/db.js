const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../trackpath.db');
const db = new Database(dbPath);

// Ensure tables and seed data exist automatically on startup
try {
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='trainees'").get();

  if (!tableCheck) {
    console.log("Initializing database schema & seed data...");
    db.exec(`
      CREATE TABLE IF NOT EXISTS schemes (id TEXT PRIMARY KEY, name TEXT, region TEXT, trade TEXT);
      CREATE TABLE IF NOT EXISTS trainees (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, name TEXT, outcomeId TEXT UNIQUE, schemeId TEXT, cohort TEXT, gender TEXT, contact TEXT, consent INTEGER, trainedOn TEXT, lastContacted TEXT);
      CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, traineeId TEXT, date TEXT, status TEXT, role TEXT, wageBand TEXT, usingSkill INTEGER, selfEmployed INTEGER);
      CREATE TABLE IF NOT EXISTS employer_validations (id INTEGER PRIMARY KEY AUTOINCREMENT, traineeId TEXT, employerName TEXT, date TEXT, status TEXT, tenure TEXT, wageBand TEXT);
      CREATE TABLE IF NOT EXISTS employers (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, name TEXT, email TEXT UNIQUE);
    `);

    const schemes = [
      { id: 's1', name: 'Digital Skilling Initiative', region: 'North', trade: 'IT & Software' },
      { id: 's2', name: 'Green Energy Apprenticeship', region: 'South', trade: 'Renewables' },
      { id: 's3', name: 'Advanced Manufacturing Program', region: 'West', trade: 'Manufacturing' }
    ];

    const insertScheme = db.prepare('INSERT OR IGNORE INTO schemes (id, name, region, trade) VALUES (?, ?, ?, ?)');
    schemes.forEach(s => insertScheme.run(s.id, s.name, s.region, s.trade));

    db.prepare('INSERT OR IGNORE INTO employers (username, password, name, email) VALUES (?, ?, ?, ?)').run('employer_demo', 'demo123', 'TechCorp India', 'hr@techcorp.in');
    db.prepare('INSERT OR IGNORE INTO employers (username, password, name, email) VALUES (?, ?, ?, ?)').run('green_hr', 'demo123', 'Green Energy Solutions', 'admin@greenenergy.in');

    const names = [
      'Amit Patel', 'Priya Singh', 'Rahul Verma', 'Sneha Reddy', 'Vikram Kumar', 'Anjali Gupta',
      'Rohit Sharma', 'Pooja Iyer', 'Arjun Nair', 'Neha Desai', 'Sanjay Joshi', 'Kavita Menon'
    ];

    let traineeCount = 1;
    for (const s of schemes) {
      for (let i = 0; i < 4; i++) {
        const tId = 't' + traineeCount.toString().padStart(2, '0');
        const name = names[(traineeCount - 1) % names.length];
        const outcomeId = 'TP-' + s.id.toUpperCase() + '-' + tId.toUpperCase();
        const username = traineeCount === 1 ? 'trainee_demo' : name.split(' ')[0].toLowerCase() + traineeCount;

        db.prepare(`
          INSERT OR IGNORE INTO trainees (id, username, password, name, outcomeId, schemeId, cohort, gender, contact, consent, trainedOn)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(tId, username, 'demo123', name, outcomeId, s.id, '2025-Q1', i % 2 === 0 ? 'Male' : 'Female', '9898765432', 1, '2025-01-15');

        db.prepare(`
          INSERT INTO checkins (traineeId, date, status, role, wageBand, usingSkill, selfEmployed)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(tId, '2025-06-15', 'employed', s.trade + ' Associate', '₹20k - ₹30k', 1, 0);

        db.prepare(`
          INSERT INTO employer_validations (traineeId, employerName, date, status, tenure, wageBand)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(tId, 'TechSolutions Pvt. Ltd.', '2025-06-20', 'employed', '3–6 months', '₹20k - ₹30k');

        traineeCount++;
      }
    }
    console.log("Database initialized & seeded successfully!");
  }
} catch (err) {
  console.error("Database initialization error:", err);
}

module.exports = db;
