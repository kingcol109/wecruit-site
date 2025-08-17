import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RecruitList from './components/RecruitList';
import RecruitProfile from './components/RecruitProfile';
import UserProfile from './components/UserProfile';
import SignIn from './components/SignIn';
import Footer from './components/Footer'; // ✅

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen"> {/* ✅ Flex layout */}
        <div className="p-4">
          <SignIn />
        </div>
        
        <div className="flex-grow"> {/* ✅ Makes the content area expand */}
          <Routes>
            <Route path="/" element={<RecruitList />} />
            <Route path="/recruit/:id" element={<RecruitProfile />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </div>

        <Footer /> {/* ✅ Footer always at bottom */}
      </div>
    </Router>
  );
}

export default App;
