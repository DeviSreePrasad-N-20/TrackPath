require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const trainees = require('./routes/trainees');
const checkins = require('./routes/checkins');
const employer = require('./routes/employer');
const analytics = require('./routes/analytics');
const { router: authRouter } = require('./routes/auth');
const ai = require('./routes/ai');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => res.json({ storage: 'sqlite' }));

app.use('/api/auth', authRouter);
app.use('/api/trainees', trainees);
app.use('/api/checkins', checkins);
app.use('/api/employer', employer);
app.use('/api/admin', analytics);
app.use('/api/ai', ai);

// Serve the React frontend from frontend-react/dist
app.use(express.static(path.join(__dirname, '..', 'frontend-react', 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '..', 'frontend-react', 'dist', 'index.html'));
});

const port = process.env.PORT || 3010;
app.listen(port, () => console.log(`TrackPath running on http://localhost:${port}`));
