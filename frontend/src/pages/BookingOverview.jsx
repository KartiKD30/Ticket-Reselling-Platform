import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../css/BookingOverview.css";

const DATE_OPTIONS = [
  { label: "Today", offset: 0 },
  { label: "Tomorrow", offset: 1 },
  { label: "Thu", offset: 2 },
  { label: "Fri", offset: 3 },
  { label: "Sat", offset: 4 },
];

const SHOWS = [
  {
    venue: "INOX Megaplex",
    label: "IMAX",
    prices: [360, 420, 480],
    times: ["10:00 AM", "01:30 PM", "05:00 PM", "08:30 PM"],
  },
  {
    venue: "PVR Phoenix Marketcity",
    label: "Platinum",
    prices: [420, 460, 520],
    times: ["09:45 AM", "12:15 PM", "03:45 PM", "07:15 PM"],
  },
  {
    venue: "Cinepolis",
    label: "2D",
    prices: [300, 320, 350],
    times: ["11:15 AM", "02:45 PM", "06:15 PM", "09:45 PM"],
  },
];

const formatIsoDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

const CONCERT_SELECTION_TYPES = ["music", "comedy", "play", "sports"];

export default function BookingOverview() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0]);
  const [selectedShow, setSelectedShow] = useState(null);

  const event = useMemo(() => {
    if (state) return state;
    const eventId = Number(id);
    return {
      id: eventId,
      name: "Dhurandhar",
      city: "Pune",
      category: "Action",
      price: 360,
      date: "2026-04-07",
      venue: "INOX Megaplex",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/dhurandhar-the-revenge-et00478890-1772893614.jpg",
      language: "Hindi",
      runtime: "2h 15m",
      rating: 8.3,
    };
  }, [id, state]);

  if (!event) {
    return (
      <main className="bo-page">
        <div className="bo-empty">
          <h2>Event not found</h2>
          <button type="button" onClick={() => navigate("/events")}>Back to events</button>
        </div>
      </main>
    );
  }

  const isMovieEvent = event?.type === "movies";
  const locationLabel = isMovieEvent ? "Theater" : "Venue";
  const locationName = event?.venue || "Main Venue";
  const locationAddress = event?.venueAddress || `${event.venue || "Main Venue"}, ${event.city || ""}`;
  const footerLocationName = isMovieEvent ? (selectedShow?.venue || "Select a theater") : locationName;

  const handleProceed = () => {
    if (isMovieEvent && !selectedShow) return;

    const selectedDateObj = new Date();
    selectedDateObj.setDate(selectedDateObj.getDate() + selectedDate.offset);

    const bookingSelection = selectedShow || {
      venue: event.venue || "Main Venue",
      time: event.time || "TBA",
      date: selectedDateObj.toISOString().slice(0, 10),
    };

    const targetPath = CONCERT_SELECTION_TYPES.includes(event?.type) ? "/concert-selection" : "/seats";

    navigate(targetPath, {
      state: {
        ...event,
        date: bookingSelection.date,
        time: bookingSelection.time,
        venue: bookingSelection.venue,
      },
    });
  };

  const showSelected = selectedShow ? `${locationLabel}: ${selectedShow.venue} • ${selectedShow.time}` : null;

  return (
    <main className="bo-page">
      <section className="bo-hero">
        <div className="bo-hero__media">
          <img src={event.image} alt={event.name} className="bo-hero__img" />
        </div>
        <div className="bo-hero__content">
          <p className="bo-tag">Movie</p>
          <h1>{event.name}</h1>
          <p>{event.city} • {event.language} • {event.runtime}</p>
          <div className="bo-meta">
            <span className="bo-meta-pill">{event.category}</span>
            <span className="bo-meta-pill">{event.rating} IMDb</span>
          </div>
        </div>
      </section>

      <section className="bo-actions">
        <div className="bo-action-card">
          {!isMovieEvent && (
            <div className="bo-location-block">
              <p className="bo-location-label">{locationLabel}</p>
              <h3 className="bo-location-name">{locationName}</h3>
              <p className="bo-location-address">{locationAddress}</p>
            </div>
          )}

          <h2>Select date</h2>
          <div className="bo-date-row">
            {DATE_OPTIONS.map((option) => {
              const dateObj = new Date();
              dateObj.setDate(dateObj.getDate() + option.offset);
              const formatted = formatIsoDate(dateObj);

              return (
                <button
                  key={option.label}
                  type="button"
                  className={`bo-date-btn${selectedDate.label === option.label ? " bo-date-btn--active" : ""}`}
                  onClick={() => setSelectedDate(option)}
                >
                  <span>{option.label}</span>
                  <strong>{formatted}</strong>
                </button>
              );
            })}
          </div>

          {isMovieEvent && (
            <>
              <h2 className="bo-shows-heading">Available shows</h2>
              <div className="bo-show-list">
                {SHOWS.map((show) => (
                  <div key={show.venue} className="bo-show-card">
                    <div className="bo-show-card__heading">
                      <div>
                        <h3>{locationLabel}: {show.venue}</h3>
                        <p>{show.label}</p>
                      </div>
                      <div className="bo-show-card__price">₹{show.prices[0]} onwards</div>
                    </div>
                    <div className="bo-time-row">
                      {show.times.map((time) => {
                        const dateObj = new Date();
                        dateObj.setDate(dateObj.getDate() + selectedDate.offset);

                        return (
                          <button
                            key={`${show.venue}-${time}`}
                            type="button"
                            className={`bo-time-btn${selectedShow?.venue === show.venue && selectedShow?.time === time ? " bo-time-btn--active" : ""}`}
                            onClick={() => setSelectedShow({
                              venue: show.venue,
                              time,
                              date: dateObj.toISOString().slice(0, 10),
                            })}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="bo-footer">
        <div className="bo-footer__summary">
          <p>{isMovieEvent ? (showSelected || "Select a date and showtime to continue") : `${locationLabel}: ${locationName}`}</p>
          <small>{locationLabel}: {footerLocationName} • Ticket price from ₹{event.price}</small>
          {!isMovieEvent && <small>Address: {locationAddress}</small>}
        </div>
        <button
          type="button"
          className="bo-proceed-btn"
          disabled={isMovieEvent && !selectedShow}
          onClick={handleProceed}
        >
          Choose Seats
        </button>
      </section>
    </main>
  );
}
