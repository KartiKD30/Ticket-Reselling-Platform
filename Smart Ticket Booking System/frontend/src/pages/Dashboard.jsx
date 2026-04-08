import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import "../css/Dashboard.css";

const bookingHistory = [
  { id: "TK-9012", event: "Pushpa 2", amount: 2499, status: "Confirmed", date: "Mar 28, 2026" },
  { id: "TK-8741", event: "Arijit Live", amount: 1800, status: "Confirmed", date: "Mar 15, 2026" },
  { id: "TK-7654", event: "IPL Match", amount: 3500, status: "Completed", date: "Feb 20, 2026" },
];

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4",
    title: "Experience Entertainment",
    subtitle: "Movies, Events & Sports — all in one place",
  },
  {
    image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
    title: "Live Concerts Near You",
    subtitle: "Book your seats before they sell out",
  },
  {
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e",
    title: "Sports Action Live",
    subtitle: "Get the best seats for the biggest matches",
  },
];

const allItems = [
  { id: 1, name: "Pushpa 2", genre: "Action", rating: "9.0", image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc" },
  { id: 2, name: "KGF 3", genre: "Action", rating: "8.8", image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c" },
  { id: 3, name: "Leo", genre: "Thriller", rating: "8.5", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba" },
  { id: 4, name: "Arijit Live", genre: "Concert", rating: "9.5", image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2" },
  { id: 5, name: "Standup Night", genre: "Comedy", rating: "8.2", image: "https://images.unsplash.com/photo-1521336575822-6da63fb45455" },
  { id: 6, name: "IPL Match", genre: "Cricket", rating: "9.2", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e" },
];

const discoverSections = [
  { key: "all", label: "✨ All", items: allItems },
  {
    key: "movies",
    label: "🔥 Movies",
    items: [
      { id: 1, name: "Pushpa 2", genre: "Action", rating: "9.0", image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc" },
      { id: 2, name: "KGF 3", genre: "Action", rating: "8.8", image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c" },
      { id: 3, name: "Leo", genre: "Thriller", rating: "8.5", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba" },
    ],
  },
  {
    key: "events",
    label: "🎉 Events",
    items: [
      { id: 4, name: "Arijit Live", genre: "Concert", rating: "9.5", image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2" },
      { id: 5, name: "Standup Night", genre: "Comedy", rating: "8.2", image: "https://images.unsplash.com/photo-1521336575822-6da63fb45455" },
    ],
  },
  {
    key: "sports",
    label: "⚽ Sports",
    items: [
      { id: 6, name: "IPL Match", genre: "Cricket", rating: "9.2", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e" },
    ],
  },
];

const quickActions = [
  { icon: "🎬", label: "Browse Events", path: "/events" },
  { icon: "🎟️", label: "My Bookings", path: "/bookings" },
  { icon: "🏷️", label: "Offers", path: "/offers" },
  { icon: "📅", label: "History", path: "/history" },
];

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const steps = 40;
    const increment = target / steps;
    const delay = duration / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, delay);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const [activeTab, setActiveTab] = useState("all");
  const [slideIndex, setSlideIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        setLoadingWallet(false);
        return;
      }

      const response = await API.get("/wallet/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWalletBalance(response.data.wallet?.balance || 0);
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => {
        setSlideIndex((prev) => (prev + 1) % heroSlides.length);
        setIsSliding(false);
      }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    if (index === slideIndex) return;
    setIsSliding(true);
    setTimeout(() => {
      setSlideIndex(index);
      setIsSliding(false);
    }, 300);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("username");
    toast.success("Logout successful!");
    navigate("/login");
  };

  const activeSection = discoverSections.find((s) => s.key === activeTab);

  return (
    <main className="dashboard-page" aria-label="User dashboard">
      {/* Header */}
      <section className="dashboard-header">
        <div>
          <p className="dashboard-greeting">{getGreeting()},</p>
          <h1 className="dashboard-title">{username} 👋</h1>
          <p className="dashboard-subtitle">Track live updates and manage your account.</p>
        </div>
        <div className="dashboard-header__actions">
          <button className="btn btn-strong" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="db-quick-actions" aria-label="Quick actions">
        {/* Wallet Card */}
        <div className="db-wallet-card">
          <span className="db-wallet-icon">💰</span>
          <div className="db-wallet-info">
            <p className="db-wallet-label">Wallet Balance</p>
            <p className="db-wallet-balance">Rs. {walletBalance.toLocaleString("en-IN")}</p>
            <small className="db-wallet-tip">Earn rewards on every booking</small>
          </div>
        </div>

        {quickActions.map((action) => (
          <button
            key={action.label}
            className="db-quick-action"
            type="button"
            onClick={() => navigate(action.path)}
          >
            <span className="db-quick-action__icon">{action.icon}</span>
            <span className="db-quick-action__label">{action.label}</span>
          </button>
        ))}
      </section>

      {/* Hero Carousel */}
      <div className="dashboard-hero">
        <img
          src={heroSlides[slideIndex].image}
          alt="Entertainment hero"
          className={`dashboard-hero__img${isSliding ? " dashboard-hero__img--fade" : ""}`}
        />
        <div className="dashboard-hero__overlay" />
        <div className="dashboard-hero__content">
          <h2 className="dashboard-hero__title">{heroSlides[slideIndex].title}</h2>
          <p className="dashboard-hero__sub">{heroSlides[slideIndex].subtitle}</p>
          <button className="dashboard-hero__btn" onClick={() => navigate("/events")}>
            Explore Now →
          </button>
        </div>
        <div className="dashboard-hero__dots">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              className={`dashboard-hero__dot${i === slideIndex ? " dashboard-hero__dot--active" : ""}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>
      </div>

      {/* Discover — Tabbed Sections */}
      <section className="dashboard-discover">
        <div className="db-section-tabs">
          {discoverSections.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`db-section-tab${activeTab === s.key ? " db-section-tab--active" : ""}`}
              onClick={() => setActiveTab(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="dashboard-scroll-row">
          {activeSection.items.map((item) => (
            <div
              key={item.id}
              className="dashboard-event-card"
              onClick={() => navigate("/events")}
            >
              <div className="dashboard-event-card__img-wrap">
                <img src={item.image} alt={item.name} className="dashboard-event-card__img" />
                <div className="dashboard-event-card__overlay">
                  <button className="dashboard-event-card__book-btn" type="button">
                    Book Now
                  </button>
                </div>
                <span className="dashboard-event-card__rating">⭐ {item.rating}</span>
              </div>
              <p className="dashboard-event-card__name">{item.name}</p>
              <span className="dashboard-event-card__genre">{item.genre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Bookings */}
      <section className="db-recent">
        <div className="db-recent__head">
          <h2 className="db-recent__title">Recent Bookings</h2>
          <button type="button" className="db-recent__view-all" onClick={() => navigate("/history")}>
            View All →
          </button>
        </div>
        <div className="db-recent__list">
          {bookingHistory.map((booking) => (
            <div key={booking.id} className="db-recent-item">
              <div className="db-recent-item__left">
                <span className="db-recent-item__icon">🎟️</span>
                <div>
                  <p className="db-recent-item__event">{booking.event}</p>
                  <p className="db-recent-item__date">{booking.date}</p>
                </div>
              </div>
              <div className="db-recent-item__right">
                <span className={`db-recent-item__status db-status--${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
                <p className="db-recent-item__amount">Rs. {booking.amount.toLocaleString("en-IN")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}