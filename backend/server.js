require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  initDB,
  getOrCreateUser,
  getAllBoxes,
  bookBoxes,
  revokeBooking,
  resetAllBoxes,
  getDriver,
} = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Health / Status Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    driver: getDriver(),
    timestamp: new Date().toISOString(),
  });
});

// 1. User Login / Registration
app.post('/api/users/login', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ error: 'Please provide a valid username.' });
    }

    const user = await getOrCreateUser(username);
    res.json({ success: true, user });
  } catch (err) {
    console.error('[API Error] User login error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 2. Get All Boxes
app.get('/api/boxes', async (req, res) => {
  try {
    const boxes = await getAllBoxes();
    res.json({
      success: true,
      boxes,
      driver: getDriver(),
    });
  } catch (err) {
    console.error('[API Error] Get boxes error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 3. Book Selected Boxes (Payment Done)
app.post('/api/boxes/book', async (req, res) => {
  try {
    const { username, boxIds } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!boxIds || !Array.isArray(boxIds) || boxIds.length === 0) {
      return res.status(400).json({ error: 'No boxes selected' });
    }

    // Ensure user exists
    await getOrCreateUser(username);

    const result = await bookBoxes(boxIds, username);
    res.json({
      success: true,
      message: `Successfully booked ${result.count} box(es)!`,
      boxIds,
    });
  } catch (err) {
    console.error('[API Error] Book boxes error:', err);
    res.status(400).json({ error: err.message || 'Failed to book boxes' });
  }
});

// 4. Revoke a Booked Box
app.post('/api/boxes/revoke', async (req, res) => {
  try {
    const { username, boxId } = req.body;
    if (!username || !boxId) {
      return res.status(400).json({ error: 'Username and boxId are required' });
    }

    await revokeBooking(parseInt(boxId, 10), username);
    res.json({
      success: true,
      message: `Box #${boxId} booking was successfully revoked!`,
      boxId,
    });
  } catch (err) {
    console.error('[API Error] Revoke booking error:', err);
    res.status(400).json({ error: err.message || 'Failed to revoke booking' });
  }
});

// 5. Reset all bookings (For testing & demonstration)
app.post('/api/boxes/reset', async (req, res) => {
  try {
    await resetAllBoxes();
    res.json({ success: true, message: 'All box bookings have been reset!' });
  } catch (err) {
    console.error('[API Error] Reset error:', err);
    res.status(500).json({ error: err.message || 'Failed to reset bookings' });
  }
});

// Start Server
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`===========================================`);
      console.log(`🚀 Box Booking API Server running on port ${PORT}`);
      console.log(`🗄️ Database Driver: ${getDriver().toUpperCase()}`);
      console.log(`===========================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
