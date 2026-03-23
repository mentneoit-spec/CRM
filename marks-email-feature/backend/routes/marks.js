const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Marks = require('../models/Marks');
const { sendMarksEmail } = require('../config/email');

// POST /api/send-marks - Send marks and email to student
router.post('/send-marks', async (req, res) => {
  try {
    const { studentId, subject, marks, totalMarks = 100, examType, remarks } = req.body;

    // Validation
    if (!studentId || !subject || marks === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, subject, and marks'
      });
    }

    if (marks < 0 || marks > totalMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${totalMarks}`
      });
    }

    // Find student
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Save marks to database
    const marksRecord = new Marks({
      studentId,
      subject,
      marks,
      totalMarks,
      examType,
      remarks
    });

    await marksRecord.save();

    // Send email
    try {
      await sendMarksEmail(
        student.email,
        student.name,
        subject,
        marks,
        totalMarks
      );

      // Update marks record
      marksRecord.emailSent = true;
      marksRecord.sentAt = new Date();
      await marksRecord.save();

      res.status(200).json({
        success: true,
        message: 'Marks saved and email sent successfully',
        data: {
          student: {
            id: student.studentId,
            name: student.name,
            email: student.email
          },
          marks: {
            subject,
            marks,
            totalMarks,
            percentage: ((marks / totalMarks) * 100).toFixed(2)
          }
        }
      });
    } catch (emailError) {
      // Marks saved but email failed
      res.status(500).json({
        success: false,
        message: 'Marks saved but email sending failed',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/students - Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find().select('-__v');
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/students - Create a student (for testing)
router.post('/students', async (req, res) => {
  try {
    const { studentId, name, email, phone, class: studentClass } = req.body;

    if (!studentId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, name, and email'
      });
    }

    const student = new Student({
      studentId,
      name,
      email,
      phone,
      class: studentClass
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/marks/:studentId - Get marks history for a student
router.get('/marks/:studentId', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: marks.length,
      data: marks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
