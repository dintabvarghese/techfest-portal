const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');

const app = express();

// Render (and most clouds) sit behind a proxy; needed for secure cookies
app.set('trust proxy', 1);

// VULNERABLE_DEMO=true switches the protections OFF so you can take the
// "before" screenshots in Steps 3-4. Never set it in production.
const VULNERABLE = process.env.VULNERABLE_DEMO === 'true';

app.use(express.json());          // must come BEFORE mongoSanitize
app.use(cookieParser());

if (!VULNERABLE) {
  app.use(helmet());              // security headers (CSP, HSTS, X-Content-Type-Options...)
  app.use(mongoSanitize());       // strips $ and . keys -> blocks NoSQL injection
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,            // allow the cookie to travel cross-origin
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', vulnerableDemo: VULNERABLE });
});

app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);

module.exports = app;
