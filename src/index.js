import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css';
import App from './App';
import { AuthProvider } from "./AuthContext"; // ✅ Import the AuthContext

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Wrap App with AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
