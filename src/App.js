import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/register/Register';
import Selection from './pages/selection/Selection';
import Staff from './pages/staff/Staff';
import Guest from './pages/guest/Guest';
import AdminLogin from './pages/admin-login/AdminLogin';
import Admin from './pages/dashboard/Admin';
import FaceScanQR from './pages/FaceScanQR';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route: redirect to user login */}
          <Route path="/" element={<Navigate to="/register" replace />} />
          
          {/* User routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/selection" element={<Selection />} /> 
          <Route path="/staff" element={<Staff />} />
          <Route path="/guest" element={<Guest />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Admin />} />
          <Route path="/face-scan" element={<FaceScanQR />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

