const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const taskRoutes = require('./modules/task/task.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Increase body size limit to 10MB for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// --- Deployment: Serve Static Files ---
const path = require('path');

// 1. Handle API 404s (so they don't return HTML)
app.use('/api/*', (req, res) => {
  res.status(404).json({ status: 'error', message: 'API route not found' });
});

// 2. Serve Frontend Static Assets
const buildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(buildPath));

// 3. SPA Catch-all (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.use(errorHandler);

module.exports = app;
