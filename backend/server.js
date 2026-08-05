const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const pool = require('./config/database');

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`School Management API running on port ${PORT}`);
  });
}

startServer();

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  process.exit(0);
});
