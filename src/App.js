// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RecruitList from './components/RecruitList';
import RecruitProfile from './components/RecruitProfile';
import SignIn from './components/SignIn'; // ✅ Import SignIn

function App() {
  return (
    <Router>
      <div className="p-4">
        <SignIn /> {/* ✅ Always show sign-in / sign-out */}
      </div>
      <Routes>
        <Route path="/" element={<RecruitList />} />
        <Route path="/recruit/:id" element={<RecruitProfile />} />
        {/* <Route path="/upload" element={<UploadRecruit />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
