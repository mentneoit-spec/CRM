import React, { useState, useEffect } from 'react';
import './App.css';
import MarksForm from './components/MarksForm';
import StudentsList from './components/StudentsList';
import axios from 'axios';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>📊 Student Marks Email System</h1>
        <p>Admin Panel - Send Exam Results via Email</p>
      </div>

      <div className="container">
        <MarksForm students={students} onSuccess={fetchStudents} />
        <StudentsList students={students} loading={loading} />
      </div>
    </div>
  );
}

export default App;
