import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './pages/AuthLogin'
import Signup from './pages/AuthSignup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import BookingOverview from './pages/BookingOverview'
import ConcertSelection from './pages/ConcertSelection'
import SeatSelection from './pages/SeatSelection'
import Payment from './pages/Payment'
import MyBookings from './pages/MyBookings'
import Offers from './pages/Offers'
import History from './pages/History'
import ResaleTicket from './pages/ResaleTicket'
import Help from './pages/Help'
import TicketPreview from './pages/TicketPreview'
import Success from './pages/Success'

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
        <Route path="/events" element={<Layout><Events /></Layout>} />
        <Route path="/help" element={<Layout><Help /></Layout>} />
        <Route path="/event/:id" element={<Layout><EventDetails /></Layout>} />
        <Route path="/buytickets/:id" element={<Layout><BookingOverview /></Layout>} />
        <Route path="/ticket/:id" element={<TicketPreview />} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>}
        />
        {/* <Route
          path="/seats"
          element={<ProtectedRoute><Layout><SeatSelection /></Layout></ProtectedRoute>}
        /> */}
        <Route
          path="/seats"
          element={<ProtectedRoute><Layout><SeatSelection /></Layout></ProtectedRoute>}
        />
        <Route
          path="/concert-selection"
          element={<ProtectedRoute><Layout><ConcertSelection /></Layout></ProtectedRoute>}
        />
        <Route
          path="/payment"
          element={<ProtectedRoute><Layout><Payment /></Layout></ProtectedRoute>}
        />
        <Route
          path="/bookings"
          element={<ProtectedRoute><Layout><MyBookings /></Layout></ProtectedRoute>}
        />
        <Route
          path="/offers"
          element={<ProtectedRoute><Layout><Offers /></Layout></ProtectedRoute>}
        />
        <Route
          path="/history"
          element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>}
        />
        <Route
          path="/resale"
          element={<ProtectedRoute><Layout><ResaleTicket /></Layout></ProtectedRoute>}
        />
        <Route
          path="/success"
          element={<ProtectedRoute><Layout><Success /></Layout></ProtectedRoute>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
