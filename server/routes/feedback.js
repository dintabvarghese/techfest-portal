const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');

const router = express.Router();

router.get('/', async (req, res) => {
  const items = await Feedback.find().sort({ createdAt: -1 }).limit(50);
  res.json(items);
});

router.post('/', body('message').isString().trim().isLength({ min: 1, max: 500 }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  // The text is stored as typed. Output escaping happens in React (see client Feedback page).
  const item = await Feedback.create({ message: req.body.message });
  res.status(201).json(item);
});

module.exports = router;
