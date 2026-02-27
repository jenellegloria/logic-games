import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Hub from './pages/Hub'
import Level1 from './pages/Level1'
import Level2 from './pages/Level2'
import Level3 from './pages/Level3'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/level1" element={<Level1 />} />
        <Route path="/level2" element={<Level2 />} />
        <Route path="/level3" element={<Level3 />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
