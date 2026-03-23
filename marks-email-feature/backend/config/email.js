const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send marks email
const sendMarksEmail = async (studentEmail, studentName, subject, marks, totalMarks) => {
  try {
    const transporter = createTransporter();

    const percentage = ((marks / totalMarks) * 100).toFixed(2);
    const grade = getGrade(percentage);

    const mailOptions = {
      from: `"School Admin" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: `Exam Results - ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .marks-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .marks-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .marks-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #555; }
            .value { color: #667eea; font-weight: bold; }
            .grade { font-size: 48px; color: #667eea; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Exam Results</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${studentName}</strong>,</p>
              <p>Your exam results for <strong>${subject}</strong> have been published.</p>
              
              <div class="marks-box">
                <div class="marks-row">
                  <span class="label">Subject:</span>
                  <span class="value">${subject}</span>
                </div>
                <div class="marks-row">
                  <span class="label">Marks Obtained:</span>
                  <span class="value">${marks} / ${totalMarks}</span>
                </div>
                <div class="marks-row">
                  <span class="label">Percentage:</span>
                  <span class="value">${percentage}%</span>
                </div>
              </div>

              <div class="grade">Grade: ${grade}</div>

              <p style="text-align: center; color: #666;">
                ${percentage >= 40 ? '🎉 Congratulations! Keep up the good work!' : '💪 Keep working hard. You can do better!'}
              </p>

              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>&copy; ${new Date().getFullYear()} School Management System</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Email sending failed:', error.message);
    throw error;
  }
};

// Calculate grade based on percentage
const getGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

module.exports = { sendMarksEmail };
