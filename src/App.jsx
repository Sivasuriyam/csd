import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TicketsProvider } from './context/TicketsContext'
import Dashboard from './pages/Dashboard'
import TicketDetails from './pages/TicketDetails'

export default function App() {
  return (
    <TicketsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </TicketsProvider>
  )
}
