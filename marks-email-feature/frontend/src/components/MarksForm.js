import React, { useState } from 'react';
import axios from 'axios';

const MarksForm = ({ students, onSuccess }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    marks: '',
    totalMarks: '100',
    examType: 'Regular'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/send-marks', {
        studentId: formData.studentId,
        subject: formData.subject,
        marks: parseFloat(formData.marks),
        totalMarks: parseFloat(formData.totalMarks),
        examType: formData.examType
      });

      setMessage({
        type: 'success',
        text: response.data.message
      });

      // Reset form
      setFormData({
        studentId: '',
        subject: '',
        marks: '',
        totalMarks: '100',
        examType: 'Regular'
      });

      // Refresh students list if needed
      if (onSuccess) onSuccess();

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send marks'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>📝 Enter Student Marks</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="studentId">Student ID *</label>
          <select
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            required
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.studentId} value={student.studentId}>
                {student.studentId} - {student.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g., Mathematics"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="marks">Marks Obtained *</label>
          <input
            type="number"
            id="marks"
            name="marks"
            value={formData.marks}
            onChange={handleChange}
            placeholder="e.g., 85"
            min="0"
            max={formData.totalMarks}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="totalMarks">Total Marks *</label>
          <input
            type="number"
            id="totalMarks"
            name="totalMarks"
            value={formData.totalMarks}
            onChange={handleChange}
            placeholder="e.g., 100"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="examType">Exam Type</label>
          <select
            id="examType"
            name="examType"
            value={formData.examType}
            onChange={handleChange}
          >
            <option value="Regular">Regular</option>
            <option value="Mid-Term">Mid-Term</option>
            <option value="Final">Final</option>
            <option value="Quiz">Quiz</option>
          </select>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? '📧 Sending...' : '📧 Send Marks & Email'}
        </button>
      </form>
    </div>
  );
};

export default MarksForm;
