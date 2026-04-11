import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import API from "../services/api";
import "../css/SeatSelection.css";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const SEATS_PER_ROW = 12;

const SEAT_META = {
  PLATINUM: { price: 400, color: "platinum", label: "Platinum" },
  GOLD:     { price: 250, color: "gold",     label: "Gold"     },
  SILVER:   { price: 150, color: "silver",   label: "Silver"   },
};

const parseToISODate = (value) => {
  const parsed = new Date(value);
  if (!isNaN(parsed)) {
    return parsed.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
};

function getSeatType(row) {
  if (["A", "B"].includes(row)) return "PLATINUM";
  if (["C", "D", "E"].includes(row)) return "GOLD";
  return "SILVER";
}

export default function SeatSelection() {
  const { state: event } = useLocation();
  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const selectedTime = event?.time || "";
  const selectedDate = parseToISODate(event?.date);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatError, setSeatError] = useState("");

  const maxTickets = 10;

  useEffect(() => {
    if (!event || !selectedTime || !selectedDate) {
      setBookedSeats([]);
      setSeatError("");
      return;
    }

    const fetchBookedSeats = async () => {
      setLoadingSeats(true);
      setSeatError("");

      try {
        const token = localStorage.getItem('access');
        if (!token) {
          throw new Error('Authentication required to fetch booked seats.');
        }

        const response = await API.get('/bookings/occupied', {
          params: {
            eventId: event.id,
            date: selectedDate,
            time: selectedTime,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBookedSeats(response.data.seats || []);
      } catch (error) {
        console.error('Failed to load booked seats:', error);
        setSeatError('Unable to load currently booked seats. Please refresh.');
      } finally {
        setLoadingSeats(false);
      }
    };

    fetchBookedSeats();
  }, [event, selectedTime, selectedDate]);

  const selectedSeatPrices = useMemo(
    () =>
      selectedSeats.map((seatId) => {
        const type = getSeatType(seatId.charAt(0));
        return SEAT_META[type].price;
      }),
    [selectedSeats],
  );

  const selectedUnitPrice = selectedSeatPrices.length > 0 ? selectedSeatPrices[0] : event?.price || 0;

  const total = useMemo(
    () =>
      selectedSeatPrices.reduce((sum, price) => sum + price, 0),
    [selectedSeatPrices],
  );

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= maxTickets) return;
      setSelectedSeats((prev) => [...prev, seatId]);
    }
  };

  const handleProceed = () => {
    if (!selectedSeats.length || !selectedTime || !selectedDate) return;
    navigate("/payment", {
      state: {
        event,
        seats: selectedSeats,
        total,
        time: selectedTime,
        date: selectedDate,
        unitPrice: selectedUnitPrice,
      },
    });
  };

  if (!event)
    return (
      <div className="ss-empty">
        <p>No event selected.</p>
        <button onClick={() => navigate("/events")}>Browse Events</button>
      </div>
    );

  const isMovieEvent = event?.type === "movies";
  const locationLabel = isMovieEvent ? "Theater" : "Venue";
  const locationName = event.venue || (isMovieEvent ? "Cineplex" : "Main Venue");
  const canProceed = selectedSeats.length > 0 && !!selectedTime && !!selectedDate;

  return (
    <main className="ss-page">
      {/* ── Header ── */}
      <div className="ss-header">
        <button className="ss-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="ss-header__info">
          <h1 className="ss-title">{event.name}</h1>
          <span className="ss-subtitle">{locationLabel}: {locationName}</span>
        </div>
        <div className="ss-header__badges">
          <span className="ss-badge ss-badge--ua">U/A</span>
          <span className="ss-badge ss-badge--format">2D</span>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="ss-layout">
        {/* Seat Map */}
        <div className="ss-map-area">
          {/* Screen */}
          <div className="ss-screen-wrapper">
            <div className="ss-screen-glow" />
            <div className="ss-screen">SCREEN</div>
            <p className="ss-screen-label">All eyes this way please!</p>
          </div>

          {/* Legend */}
          <div className="ss-legend">
            {Object.entries(SEAT_META).map(([type, meta]) => (
              <div key={type} className="ss-legend-item">
                <span className={`ss-swatch ss-swatch--${meta.color}`} />
                <span className="ss-legend-text">
                  {meta.label} <strong>₹{meta.price}</strong>
                </span>
              </div>
            ))}
            <div className="ss-legend-item">
              <span className="ss-swatch ss-swatch--booked" />
              <span className="ss-legend-text">Booked</span>
            </div>
            <div className="ss-legend-item">
              <span className="ss-swatch ss-swatch--selected" />
              <span className="ss-legend-text">Selected</span>
            </div>
          </div>

          {/* Seat Count Bar */}
          <div className="ss-count-bar">
            <span>
              <strong>{selectedSeats.length}</strong> / {maxTickets} seats selected
            </span>
            {selectedSeats.length >= maxTickets && (
              <span className="ss-count-bar__warn">Maximum reached</span>
            )}
          </div>

          {selectedTime && (
            <div className="ss-seat-info">
              {loadingSeats ? (
                <span>Loading booked seats...</span>
              ) : seatError ? (
                <span className="ss-seat-error">{seatError}</span>
              ) : (
                <span>{bookedSeats.length} seats already booked</span>
              )}
            </div>
          )}

          {/* Seat Grid */}
          <div className="ss-seat-map">
            {ROWS.map((row, rowIndex) => {
              const type = getSeatType(row);
              const meta = SEAT_META[type];
              const half = SEATS_PER_ROW / 2;

              return (
                <div key={row} className="ss-row-block">
                  <span className={`ss-row-label ss-row-label--${meta.color}`}>{row}</span>

                  <div className={`ss-seat-row ss-seat-row--${rowIndex}`}>
                    {/* Left half */}
                    {Array.from({ length: half }, (_, i) => {
                      const seatId = `${row}${i + 1}`;
                      const isSelected = selectedSeats.includes(seatId);
                      const isBooked = bookedSeats.includes(seatId);
                      return (
                        <button
                          key={seatId}
                          type="button"
                          disabled={isBooked}
                          onClick={() => toggleSeat(seatId)}
                          title={`${seatId} · ${meta.label} · ₹${meta.price}`}
                          className={[
                            "ss-seat",
                            `ss-seat--${meta.color}`,
                            isBooked ? "ss-seat--booked" : "",
                            isSelected ? "ss-seat--selected" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {i + 1}
                        </button>
                      );
                    })}

                    {/* Aisle */}
                    <span className="ss-aisle" />

                    {/* Right half */}
                    {Array.from({ length: half }, (_, i) => {
                      const seatNum = half + i + 1;
                      const seatId = `${row}${seatNum}`;
                      const isSelected = selectedSeats.includes(seatId);
                      const isBooked = bookedSeats.includes(seatId);
                      return (
                        <button
                          key={seatId}
                          type="button"
                          disabled={isBooked}
                          onClick={() => toggleSeat(seatId)}
                          title={`${seatId} · ${meta.label} · ₹${meta.price}`}
                          className={[
                            "ss-seat",
                            `ss-seat--${meta.color}`,
                            isBooked ? "ss-seat--booked" : "",
                            isSelected ? "ss-seat--selected" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>

                  <span className={`ss-row-label ss-row-label--${meta.color}`}>{row}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Sticky Sidebar ── */}
        <aside className="ss-sidebar">
          <div className="ss-sidebar__inner">
            <h3 className="ss-sidebar__heading">Booking Summary</h3>

            {/* Event snippet */}
            <div className="ss-sidebar__event">
              {event.image && (
                <img
                  src={event.image}
                  alt={event.name}
                  className="ss-sidebar__poster"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <div>
                <p className="ss-sidebar__event-name">{event.name}</p>
                <p className="ss-sidebar__event-venue">{locationLabel}: {locationName}</p>
              </div>
            </div>

            {/* Details rows */}
            <div className="ss-info-rows">
              <div className="ss-info-row">
                <span>Seats</span>
                <span className={selectedSeats.length ? "ss-val--set" : "ss-val--muted"}>
                  {selectedSeats.length ? `${selectedSeats.length} selected` : "—"}
                </span>
              </div>
            </div>

            {/* Seat tags */}
            {selectedSeats.length > 0 && (
              <div className="ss-seat-tags">
                {selectedSeats.map((s) => (
                  <span key={s} className="ss-seat-tag">{s}</span>
                ))}
                <button
                  className="ss-clear-btn"
                  onClick={() => setSelectedSeats([])}
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="ss-divider" />

            {/* Total */}
            <div className="ss-total-row">
              <span>Total Amount</span>
              <span className="ss-total-amount">₹{total}</span>
            </div>

            {/* Proceed Button */}
            <button
              className={`ss-pay-btn${canProceed ? "" : " ss-pay-btn--disabled"}`}
              disabled={!canProceed}
              onClick={handleProceed}
            >
              Proceed to Payment →
            </button>

            {!canProceed && (
              <p className="ss-pay-hint">
                {!selectedTime ? "Please go back and select a show first" : "Please select at least one seat"}
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
