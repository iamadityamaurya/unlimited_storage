import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import TelegramLogin from './pages/TelegramLogin'
import Home from './pages/Home'

function App() {
  const [apiCredentials, setApiCredentials] = useState(null);

  const handleLoginSuccess = (creds) => {
    setApiCredentials(creds);
  };

  const handleLogout = () => {
    setApiCredentials(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <section id="center">
            <div className="mt-8 mb-8">
              <TelegramLogin onLoginSuccess={handleLoginSuccess} />
            </div>
          </section>
        } />
        <Route 
          path="/" 
          element={
            apiCredentials ? (
              <Home apiCredentials={apiCredentials} onGlobalLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
