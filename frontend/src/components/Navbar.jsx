import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../services/api'

const services = ["All", "Movies", "Music", "Comedy", "Play", "Sports"];
const cities = ["All", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Goa"];

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCity, setSelectedCity] = useState(() => {
    const stored = localStorage.getItem('selectedCity')
    return stored || 'Bangalore'
  })
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [walletBalance, setWalletBalance] = useState(0)
  const [loadingWallet, setLoadingWallet] = useState(false)
  const isLoggedIn = Boolean(localStorage.getItem('access'))
  const loggedInUsername = localStorage.getItem('username') || 'User'

  // Fetch wallet balance
  useEffect(() => {
    if (isLoggedIn) {
      fetchWalletBalance()
    }
  }, [isLoggedIn])

  // Refresh wallet when user returns from payment/booking pages
  useEffect(() => {
    if (isLoggedIn && (location.pathname === '/dashboard' || location.pathname === '/success' || location.pathname === '/bookings')) {
      const timer = setTimeout(() => {
        fetchWalletBalance()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [location.pathname, isLoggedIn])

  const fetchWalletBalance = async () => {
    try {
      setLoadingWallet(true)
      const token = localStorage.getItem('access')
      if (!token) return

      const response = await API.get('/wallet/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setWalletBalance(response.data.wallet?.balance || 0)
    } catch (error) {
      console.error('Failed to fetch wallet:', error)
      setWalletBalance(0)
    } finally {
      setLoadingWallet(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('username')
    navigate('/login')
    setIsMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity)
      params.set('search', searchQuery.trim())
      navigate(`/events?${params.toString()}`)
      setIsMenuOpen(false)
    }
  }

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  useEffect(() => {
    if (location.pathname === '/events') {
      const params = new URLSearchParams(location.search)
      const cityParam = params.get('city')
      const typeParam = params.get('type')
      if (cityParam && cities.includes(cityParam)) {
        setSelectedCity(cityParam)
      } else {
        setSelectedCity('All')
      }
      if (typeParam) {
        setSelectedType(typeParam.toLowerCase())
      } else {
        setSelectedType('all')
      }
    }
  }, [location])

  useEffect(() => {
    localStorage.setItem('selectedCity', selectedCity)
  }, [selectedCity])

  const handleTypeSelect = (type) => {
    const lowerType = type.toLowerCase()
    setSelectedType(lowerType)
    setIsMenuOpen(false)
    const params = new URLSearchParams()
    if (lowerType === 'all') {
      setSelectedCity('All')
      // No type param for 'all'
    } else {
      if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity)
      params.set('type', lowerType)
    }
    const path = params.toString() ? `/events?${params.toString()}` : '/events'
    navigate(path)
  }

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setIsCityMenuOpen(false)
    setIsMenuOpen(false)
    const params = new URLSearchParams()
    if (city === 'All') {
      setSelectedType('all')
      // No params for 'All' city
    } else {
      if (selectedType !== 'all') params.set('type', selectedType)
      params.set('city', city)
    }
    const path = params.toString() ? `/events?${params.toString()}` : '/events'
    navigate(path)
  }

  return (
    <header className="navbar">
      <div className="navbar-top">
        <div className="brand" onClick={() => { navigate(isLoggedIn ? '/dashboard' : '/events'); setIsMenuOpen(false); }} style={{ cursor: 'pointer' }}>
          <span className="brand-mark">ST</span>
          <div>
            <p className="brand-title">Smart Ticket</p>
            <p className="brand-subtitle">Booking System</p>
          </div>
        </div>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-utilities ${isMenuOpen ? 'open' : ''}`}>
          <div className="city-picker">
            <button
              type="button"
              className="city-picker-button"
              aria-haspopup="menu"
              aria-expanded={isCityMenuOpen}
              onClick={() => setIsCityMenuOpen((current) => !current)}
            >
              <svg className="city-pin-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#d61f3c"/>
              </svg>
              <div className="city-picker-text">
                <span className="city-picker-label">City</span>
                <span className="city-picker-value">{selectedCity}</span>
              </div>
              <span className="city-picker-arrow">▾</span>
            </button>

            <div className={`city-dropdown${isCityMenuOpen ? ' open' : ''}`} role="menu">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`city-dropdown-item${selectedCity === city ? ' active' : ''}`}
                  onClick={() => handleCitySelect(city)}
                  role="menuitem"
                >
                  {city === 'All' ? 'All Locations' : city}
                </button>
              ))}
            </div>
          </div>

          <div className="search-wrap">
            <form onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search events, movies, concerts..."
                aria-label="Search events, movies, concerts"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
              />
            </form>
          </div>

          <div className="nav-actions">
            {isLoggedIn ? (
              <>
                <button 
                  className="wallet-btn" 
                  type="button" 
                  onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                  title="View wallet details"
                >
                  <span className="wallet-icon">💰</span>
                  <span className="wallet-label">Wallet</span>
                  <span className="wallet-balance">{loadingWallet ? '...' : `₹${walletBalance.toLocaleString('en-IN')}`}</span>
                </button>
                <button className="btn btn-light" type="button" onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}>
                  {loggedInUsername}
                </button>
                <button className="btn btn-strong" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-light" type="button" onClick={() => { navigate('/login'); setIsMenuOpen(false); }}>
                  Login
                </button>
                <button className="btn btn-strong" type="button" onClick={() => { navigate('/signup'); setIsMenuOpen(false); }}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`navbar-bottom ${isMenuOpen ? 'open' : ''}`}>
        <nav className="service-tabs" aria-label="Service categories">
          {services.map((service) => (
            <button
              key={service}
              type="button"
              className={selectedType === service.toLowerCase() ? 'service-tab active' : 'service-tab'}
              onClick={() => handleTypeSelect(service)}
            >
              {service}
            </button>
          ))}
        </nav>

        <nav className="nav-links" aria-label="Primary navigation">
          <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</a>
          <a onClick={() => { navigate('/offers'); setIsMenuOpen(false); }} style={{ cursor: 'pointer' }}>Offers</a>
          <a onClick={() => { navigate('/bookings'); setIsMenuOpen(false); }} style={{ cursor: 'pointer' }}>My Bookings</a>
          <a onClick={() => { navigate('/resale'); setIsMenuOpen(false); }} style={{ cursor: 'pointer' }}>Resale Ticket</a>
          <a onClick={() => { navigate('/help'); setIsMenuOpen(false); }} style={{ cursor: 'pointer' }}>Help</a>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
