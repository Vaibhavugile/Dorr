// src/App.js (Example with react-router-dom)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import AdminPage from './AdminPage'; // Import the new AdminPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} /> {/* New route for admin */}
        {/* You can add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;