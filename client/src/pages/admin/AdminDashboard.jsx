import { Routes, Route } from 'react-router-dom'

const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Events</h3>
          <p className="text-3xl font-bold text-green-600">567</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Bookings</h3>
          <p className="text-3xl font-bold text-purple-600">8,901</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Revenue</h3>
          <p className="text-3xl font-bold text-orange-600">$45,678</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            👥 User Management
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            🎪 Event Management
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            📊 Analytics
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            💰 Financial Reports
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            🛡️ Security Settings
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            📧 System Notifications
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
