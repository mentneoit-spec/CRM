const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: 'Student'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  examType: {
    type: String,
    default: 'Regular',
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Marks', marksSchema);
