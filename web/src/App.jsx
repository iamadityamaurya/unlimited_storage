import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import TelegramLogin from './pages/TelegramLogin'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <section id="center">
            <div className="mt-8 mb-8">
              <TelegramLogin onLoginSuccess={() => window.location.href = '/'} />
            </div>
          </section>
        } />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
