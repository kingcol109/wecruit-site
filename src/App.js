// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RecruitList from './components/RecruitList';
import RecruitProfile from './components/RecruitProfile';
// Comment this out for now since you're not using UploadRecruit:
// import UploadRecruit from './components/UploadRecruit';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RecruitList />} />
        <Route path="/recruit/:id" element={<RecruitProfile />} />
        {/* Uncomment this line ONLY if UploadRecruit.js exists */}
        {/* <Route path="/upload" element={<UploadRecruit />} /> */}
      </Routes>
    </Router>
  );
  return (
    <div className="text-3xl text-green-500 font-bold p-4">
      ✅ Tailwind is Now Working
    </div>
  );
}
export default App;
