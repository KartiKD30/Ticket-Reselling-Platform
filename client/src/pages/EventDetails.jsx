import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "../css/EventDetails.css";

const EVENT_FALLBACKS = [
  {
    id: 1,
    name: "Dhurandhar",
    city: "Mumbai",
    category: "Action",
    price: 360,
    date: "Apr 20, 2026",
    image:
      "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/dhurandhar-the-revenge-et00478890-1772893614.jpg",
    venue: "INOX Megaplex",
  },
  {
    id: 101,
    name: "Arijit Singh Live",
    city: "Bangalore",
    category: "Concert",
    price: 1500,
    date: "May 05, 2026",
    image:
      "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=1200&q=80",
    venue: "Phoenix Arena",
  },
];

export default function EventDetails() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingEvent, setLoadingEvent] = useState(!state);
  const [fetchedEvent, setFetchedEvent] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [liked, setLiked] = useState(false);

  // Fetch event details if not provided via state
  useEffect(() => {
    if (!state && id) {
      const fetchEvent = async () => {
        try {
          setLoadingEvent(true);
          const response = await API.get(`/events/public/${id}`);
          if (response.data) {
            const event = response.data;
            setFetchedEvent({
              id: event._id,
              _id: event._id,
              name: event.title,
              city: event.city || 'Unknown',
              category: event.category || 'Event',
              price: event.price,
              date: new Date(event.date).toLocaleDateString(),
              image: event.imageUrl || 'https://picsum.photos/seed/event/800/600',
              venue: event.venue,
              description: event.description,
              totalTickets: event.totalTickets,
              availableTickets: event.availableTickets
            });
          }
        } catch (error) {
          console.error('Error fetching event:', error);
          // Fall back to EVENT_FALLBACKS
        } finally {
          setLoadingEvent(false);
        }
      };
      fetchEvent();
    } else {
      setLoadingEvent(false);
    }
  }, [id, state]);

  const event = useMemo(() => {
    if (state) return state;
    if (fetchedEvent) return fetchedEvent;
    const eventId = Number(id);
    return EVENT_FALLBACKS.find((e) => e.id === eventId) || null;
  }, [id, state, fetchedEvent]);

  if (loadingEvent) {
    return (
      <main className="ed-page">
        <div className="ed-no-data">
          <h2>Loading event details...</h2>
          <div style={{marginTop: '20px', fontSize: '40px'}}>⏳</div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="ed-page">
        <div className="ed-no-data">
          <h2>Event not found</h2>
          <button type="button" className="ed-book-btn" onClick={() => navigate("/events")}>Back to Events</button>
        </div>
      </main>
    );
  }

  const perTicket = event.price || 0;
  const isMovieEvent = event?.type === "movies";
  const locationLabel = isMovieEvent ? "Theater" : "Venue";
  const locationName = event.venue || (isMovieEvent ? "PVR Cinemas" : "Main Venue");
  const locationAddress = event?.venueAddress || `${locationName}, ${event.city || ""}`;

  return (
    <main className="ed-page">
      <section className="ed-hero">
        <img src={event.image} alt={event.name} className="ed-hero__img" />
        <div className="ed-hero__overlay" />
        <div className="ed-hero__content">
          <span className="ed-hero__pill">{event.category || "Entertainment"}</span>
          <h1>{event.name}</h1>
          <p>{event.city} • {event.date || "Coming Soon"}</p>
        </div>
      </section>

      <section className="ed-wrapper">
        <img src={event.image} alt={event.name} className="ed-poster" />

        <div className="ed-info">
          <div className="ed-info__top">
            <div>
              <h2 className="ed-info__title">{event.name}</h2>
              <p className="ed-info__meta">{event.city} • {locationLabel}: {locationName}</p>
            </div>
            <button
              type="button"
              className={`ed-like-btn${liked ? " ed-like-btn--active" : ""}`}
              onClick={() => setLiked((v) => !v)}
            >
              {liked ? "Saved" : "Save"}
            </button>
          </div>

          <div className="ed-pricing">
            <p className="ed-info__price">Rs. {perTicket.toLocaleString("en-IN")}</p>
            <span>per ticket</span>
          </div>

          <div className="ed-actions">
            <button
              type="button"
              className="ed-book-btn"
              onClick={() => navigate(`/buytickets/${event.id}`, { state: event })}
            >
              Book Tickets
            </button>
            <button type="button" className="ed-secondary-btn" onClick={() => navigate("/events")}>More Events</button>
          </div>
        </div>
      </section>

      <section className="ed-content">
        <div className="ed-tabs">
          {[
            { key: "overview", label: "Overview" },
            { key: "venue", label: locationLabel },
            { key: "policy", label: "Policies" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`ed-tab${activeTab === tab.key ? " ed-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="ed-panel">
            <h3>About this event</h3>
            <p>
              Enjoy a premium entertainment experience with high-quality visuals, immersive sound,
              and comfortable seating. Early booking is recommended for the best seat availability.
            </p>
            <div className="ed-grid">
              <div className="ed-box"><strong>Date</strong><p>{event.date || "Coming Soon"}</p></div>
              <div className="ed-box"><strong>Language</strong><p>Hindi / English</p></div>
              <div className="ed-box"><strong>Duration</strong><p>2h 20m</p></div>
            </div>
          </div>
        )}

        {activeTab === "venue" && (
          <div className="ed-panel">
            <h3>{locationLabel} details</h3>
            <div className="ed-grid">
              <div className="ed-box"><strong>{locationLabel}</strong><p>{locationName}</p></div>
              <div className="ed-box"><strong>Address</strong><p>{locationAddress}</p></div>
              <div className="ed-box"><strong>City</strong><p>{event.city}</p></div>
              <div className="ed-box"><strong>Entry</strong><p>Gate opens 45 mins before showtime</p></div>
            </div>
          </div>
        )}

        {activeTab === "policy" && (
          <div className="ed-panel">
            <h3>Booking policies</h3>
            <ul className="ed-policy-list">
              <li>No cancellation within 2 hours of showtime.</li>
              <li>Carry valid ID and booking confirmation at entry.</li>
              <li>Outside food and beverages are not allowed.</li>
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
