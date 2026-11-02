const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
