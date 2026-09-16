require('dotenv').config();
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

let dbDriver = 'mysql'; // 'mysql' or 'json-storage'
let pool = null;

const TOTAL_BOXES = 36;
const JSON_DB_FILE = path.join(__dirname, 'database.json');

// Pure JS local storage helper for instant execution without native compile issues
function getJsonDB() {
  if (!fs.existsSync(JSON_DB_FILE)) {
    const initialBoxes = [];
    for (let i = 1; i <= TOTAL_BOXES; i++) {
      initialBoxes.push({
        id: i,
        box_number: i,
        booked_by: null,
        booked_at: null,
      });
    }
    const initialData = {
      users: [],
      boxes: initialBoxes,
    };
    fs.writeFileSync(JSON_DB_FILE, JSON_stringify(initialData), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(JSON_DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('[DB] Error parsing database.json:', e);
    return { users: [], boxes: [] };
  }
}

function saveJsonDB(data) {
  fs.writeFileSync(JSON_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function JSON_stringify(obj) {
  return JSON.stringify(obj, null, 2);
}

async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const database = process.env.DB_NAME || 'box_booking_db';

  try {
    console.log(`[DB] Connecting to MySQL at ${host}:${port} as ${user}...`);
    // Connect without selecting DB first to create database if not existing
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      connectTimeout: 3000,
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // Create pool for the database
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS boxes (
        id INT PRIMARY KEY,
        box_number INT NOT NULL,
        booked_by VARCHAR(100) NULL,
        booked_at TIMESTAMP NULL
      );
    `);

    // Seed boxes if empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM boxes');
    if (rows[0].count === 0) {
      console.log(`[DB] Seeding ${TOTAL_BOXES} boxes into MySQL table...`);
      for (let i = 1; i <= TOTAL_BOXES; i++) {
        await pool.query(
          'INSERT INTO boxes (id, box_number, booked_by, booked_at) VALUES (?, ?, NULL, NULL)',
          [i, i]
        );
      }
    }

    dbDriver = 'mysql';
    console.log(`[DB] ✅ Connected successfully to MySQL database "${database}"!`);
  } catch (err) {
    console.warn(`[DB] ⚠️ Could not connect to MySQL server (${err.message}).`);
    console.warn(`[DB] 💡 Using local persistent file store (database.json) for instant execution.`);
    
    getJsonDB(); // initialize file if needed
    dbDriver = 'json-storage';
    console.log(`[DB] ✅ Active storage engine: Local Persistent JSON Store (Schema-compatible with MySQL)`);
  }
}

// Database helper functions
async function getOrCreateUser(username) {
  const trimmed = username.trim();
  if (!trimmed) throw new Error('Username cannot be empty');

  if (dbDriver === 'mysql') {
    const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [trimmed]);
    if (existing.length > 0) {
      return existing[0];
    }
    const [result] = await pool.query('INSERT INTO users (username) VALUES (?)', [trimmed]);
    return { id: result.insertId, username: trimmed };
  } else {
    const data = getJsonDB();
    let user = data.users.find((u) => u.username.toLowerCase() === trimmed.toLowerCase());
    if (user) return user;

    const newId = data.users.length > 0 ? Math.max(...data.users.map((u) => u.id)) + 1 : 1;
    user = {
      id: newId,
      username: trimmed,
      created_at: new Date().toISOString(),
    };
    data.users.push(user);
    saveJsonDB(data);
    return user;
  }
}

async function getAllBoxes() {
  if (dbDriver === 'mysql') {
    const [boxes] = await pool.query('SELECT id, box_number, booked_by, booked_at FROM boxes ORDER BY id ASC');
    return boxes;
  } else {
    const data = getJsonDB();
    return data.boxes.sort((a, b) => a.id - b.id);
  }
}

async function bookBoxes(boxIds, username) {
  if (!Array.isArray(boxIds) || boxIds.length === 0) {
    throw new Error('No boxes selected for booking');
  }

  const numericIds = boxIds.map((id) => parseInt(id, 10));

  if (dbDriver === 'mysql') {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [existing] = await connection.query(
        'SELECT id, booked_by FROM boxes WHERE id IN (?) AND booked_by IS NOT NULL',
        [numericIds]
      );
      
      if (existing.length > 0) {
        const conflictIds = existing.map((b) => b.id).join(', ');
        throw new Error(`Box(es) ${conflictIds} are already booked!`);
      }

      await connection.query(
        'UPDATE boxes SET booked_by = ?, booked_at = NOW() WHERE id IN (?)',
        [username, numericIds]
      );

      await connection.commit();
      return { success: true, count: numericIds.length };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } else {
    const data = getJsonDB();
    for (const id of numericIds) {
      const box = data.boxes.find((b) => b.id === id);
      if (!box) throw new Error(`Box ${id} not found.`);
      if (box.booked_by) throw new Error(`Box ${id} is already booked by ${box.booked_by}!`);
    }

    const now = new Date().toISOString();
    for (const id of numericIds) {
      const box = data.boxes.find((b) => b.id === id);
      box.booked_by = username;
      box.booked_at = now;
    }
    saveJsonDB(data);
    return { success: true, count: numericIds.length };
  }
}

async function revokeBooking(boxId, username) {
  const numericId = parseInt(boxId, 10);

  if (dbDriver === 'mysql') {
    const [result] = await pool.query(
      'UPDATE boxes SET booked_by = NULL, booked_at = NULL WHERE id = ? AND booked_by = ?',
      [numericId, username]
    );
    if (result.affectedRows === 0) {
      throw new Error('Box was not booked by this user or does not exist');
    }
    return { success: true };
  } else {
    const data = getJsonDB();
    const box = data.boxes.find((b) => b.id === numericId);
    if (!box || box.booked_by !== username) {
      throw new Error('Box was not booked by this user or does not exist');
    }
    box.booked_by = null;
    box.booked_at = null;
    saveJsonDB(data);
    return { success: true };
  }
}

async function resetAllBoxes() {
  if (dbDriver === 'mysql') {
    await pool.query('UPDATE boxes SET booked_by = NULL, booked_at = NULL');
    return { success: true };
  } else {
    const data = getJsonDB();
    data.boxes.forEach((box) => {
      box.booked_by = null;
      box.booked_at = null;
    });
    saveJsonDB(data);
    return { success: true };
  }
}

function getDriver() {
  return dbDriver;
}

module.exports = {
  initDB,
  getOrCreateUser,
  getAllBoxes,
  bookBoxes,
  revokeBooking,
  resetAllBoxes,
  getDriver,
};
