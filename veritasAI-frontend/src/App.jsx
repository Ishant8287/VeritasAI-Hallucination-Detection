import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Verify from './pages/Verify'
import Logs from './pages/Logs'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-base text-text-primary font-body antialiased">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}