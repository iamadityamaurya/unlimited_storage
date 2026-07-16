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
        {/* Main home redirects to drives or last selected drive inside Home component */}
        <Route path="/" element={<Home />} />
        <Route path="/drives" element={<Home />} />
        
        {/* Drive views */}
        <Route path="/drive/:chatId" element={<Home />} />
        <Route path="/drive/:chatId/file/:messageId" element={<Home />} />
        
        {/* Drive folder views */}
        <Route path="/drive/:chatId/folder/:folderId" element={<Home />} />
        <Route path="/drive/:chatId/folder/:folderId/file/:messageId" element={<Home />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
