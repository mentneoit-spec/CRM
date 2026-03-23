import React from 'react';

const StudentsList = ({ students, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <h2>👥 Registered Students</h2>
        <div className="loading">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>👥 Registered Students ({students.length})</h2>
      
      {students.length === 0 ? (
        <div className="empty-state">
          <p>No students registered yet</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
            Add students using the API or database
          </p>
        </div>
      ) : (
        <div className="students-list">
          {students.map((student) => (
            <div key={student.studentId} className="student-item">
              <h3>{student.name}</h3>
              <p><strong>ID:</strong> {student.studentId}</p>
              <p><strong>Email:</strong> {student.email}</p>
              {student.class && <p><strong>Class:</strong> {student.class}</p>}
              {student.phone && <p><strong>Phone:</strong> {student.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsList;
