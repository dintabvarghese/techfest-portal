const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const VULNERABLE = process.env.VULNERABLE_DEMO === 'true';
const isProd = process.env.NODE_ENV === 'production';

// Step 5: safe cookie options
const cookieOptions = {
  httpOnly: true,                       // JavaScript cannot read it -> XSS cannot steal it
  secure: isProd,                       // HTTPS only (on in production)
  sameSite: isProd ? 'none' : 'lax',    // 'none' needed because Netlify and Render are different sites;
                                        // use 'strict' if frontend and API share one domain
  maxAge: 24 * 60 * 60 * 1000,
};

// express-validator rules: input must be a plain string, not an object like {"$ne": null}
const registerRules = [
  body('name').isString().trim().notEmpty(),
  body('email').isString().isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6 }),
];
const loginRules = [body('email').isString().isEmail(), body('password').isString().notEmpty()];

function checkErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.post('/register', registerRules, checkErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// In VULNERABLE_DEMO mode validation is skipped and the raw body goes into the query,
// so {"email":{"$ne":null},"password":{"$ne":null}} logs you in as the first user.
router.post('/login', VULNERABLE ? [] : [...loginRules, checkErrors], async (req, res) => {
  try {
    const { email, password } = req.body;

    if (VULNERABLE) {
      // INSECURE on purpose: password compared inside the query (demo only)
      const user = await User.findOne({ email, password });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      return res.json({ demo: 'logged in without a valid password!', user: { name: user.name, email: user.email } });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, cookieOptions);
    res.json({ name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => res.json({ id: req.user.id, name: req.user.name }));

module.exports = router;
