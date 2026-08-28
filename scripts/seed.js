const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../trackpath.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE schemes (id TEXT PRIMARY KEY, name TEXT, region TEXT, trade TEXT);
  CREATE TABLE trainees (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, name TEXT, outcomeId TEXT UNIQUE, schemeId TEXT, cohort TEXT, gender TEXT, contact TEXT, consent INTEGER, trainedOn TEXT, lastContacted TEXT);
  CREATE TABLE checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, traineeId TEXT, date TEXT, status TEXT, role TEXT, wageBand TEXT, usingSkill INTEGER, selfEmployed INTEGER);
  CREATE TABLE employer_validations (id INTEGER PRIMARY KEY AUTOINCREMENT, traineeId TEXT, employerName TEXT, date TEXT, status TEXT, tenure TEXT, wageBand TEXT);
  CREATE TABLE employers (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, name TEXT, email TEXT UNIQUE);
`);

const schemes = [
  { id: 's1', name: 'Digital Skilling Initiative', region: 'North', trade: 'IT & Software' },
  { id: 's2', name: 'Green Energy Apprenticeship', region: 'South', trade: 'Renewables' },
  { id: 's3', name: 'Advanced Manufacturing Program', region: 'West', trade: 'Manufacturing' }
];

db.prepare('INSERT INTO employers (username, password, name, email) VALUES (?, ?, ?, ?)').run('employer_demo', 'demo123', 'TechCorp India', 'hr@techcorp.in');
db.prepare('INSERT INTO employers (username, password, name, email) VALUES (?, ?, ?, ?)').run('green_hr', 'demo123', 'Green Energy Solutions', 'admin@greenenergy.in');

const names = [
  'Amit Patel', 'Priya Singh', 'Rahul Verma', 'Sneha Reddy', 'Vikram Kumar', 'Anjali Gupta',
  'Rohit Sharma', 'Pooja Iyer', 'Arjun Nair', 'Neha Desai', 'Sanjay Joshi', 'Kavita Menon'
];

let trainees = [];
let checkins = [];
let employer_validations = [];

let traineeCount = 1;
for (const s of schemes) {
  for (let i = 0; i < 4; i++) {
    const tId = 't' + traineeCount.toString().padStart(2, '0');
    const name = names[(traineeCount - 1) % names.length];
    const consent = Math.random() > 0.2; // 80% consent rate
    
    // Create a simple username based on name
    const username = name.split(' ')[0].toLowerCase() + traineeCount;
    
    // Generate Anonymous Outcome ID
    const outcomeId = 'TP-' + s.id.toUpperCase() + '-' + tId.toUpperCase();
    
    trainees.push({
      id: tId,
      username: traineeCount === 1 ? 'trainee_demo' : username, // specific demo user
      password: 'demo123',
      name,
      outcomeId,
      schemeId: s.id,
      cohort: '2025-Q1',
      gender: i % 2 === 0 ? 'Male' : 'Female',
      contact: '98' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
      consent: consent ? 1 : 0,
      trainedOn: '2025-01-15'
    });
    
    if (consent) {
      const isEmployed = Math.random() > 0.3;
      if (isEmployed) {
        checkins.push({
          traineeId: tId,
          date: '2025-06-15',
          status: 'employed',
          role: s.trade + ' Assistant',
          wageBand: '₹20k–30k',
          usingSkill: 1,
          selfEmployed: 0
        });
        
        if (Math.random() > 0.5) {
          employer_validations.push({
            traineeId: tId,
            employerName: 'TechCorp India',
            date: '2025-06-20',
            status: 'employed',
            tenure: 'Less than 3 months',
            wageBand: '₹20k–30k'
          });
        }
      } else {
        checkins.push({
          traineeId: tId,
          date: '2025-06-15',
          status: 'not-employed',
          role: '',
          wageBand: 'Below ₹10k',
          usingSkill: 0,
          selfEmployed: 0
        });
      }
    }
    traineeCount++;
  }
}

const insertScheme = db.prepare('INSERT INTO schemes (id, name, region, trade) VALUES (?, ?, ?, ?)');
schemes.forEach(s => insertScheme.run(s.id, s.name, s.region, s.trade));

const insertTrainee = db.prepare('INSERT INTO trainees (id, username, password, name, outcomeId, schemeId, cohort, gender, contact, consent, trainedOn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
trainees.forEach(t => insertTrainee.run(t.id, t.username, t.password, t.name, t.outcomeId, t.schemeId, t.cohort, t.gender, t.contact, t.consent, t.trainedOn));

const insertCheckin = db.prepare('INSERT INTO checkins (traineeId, date, status, role, wageBand, usingSkill, selfEmployed) VALUES (?, ?, ?, ?, ?, ?, ?)');
checkins.forEach(c => insertCheckin.run(c.traineeId, c.date, c.status, c.role, c.wageBand, c.usingSkill, c.selfEmployed));

const insertEmployer = db.prepare('INSERT INTO employer_validations (traineeId, employerName, date, status, tenure, wageBand) VALUES (?, ?, ?, ?, ?, ?)');
employer_validations.forEach(e => insertEmployer.run(e.traineeId, e.employerName, e.date, e.status, e.tenure, e.wageBand));

console.log('Database seeded with usernames and passwords!');
