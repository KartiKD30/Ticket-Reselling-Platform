import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import API from "../services/api";
import { buildTicketPath, getTicketUrl } from "../utils/ticket";
import "../css/MyBookings.css";

const STATUS_META = {
  Confirmed: { cls: "mb-status--confirmed", icon: "✅" },
  Completed: { cls: "mb-status--completed", icon: "🏁" },
  Canceled:  { cls: "mb-status--canceled",  icon: "❌" },
};

function getCategoryIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("ipl") || n.includes("match") || n.includes("cup")) return "⚽";
  if (n.includes("live") || n.includes("concert") || n.includes("fest")) return "🎤";
  return "🎬";
}

const parseShowDateTime = (date, time) => {
  if (!date || !time) return null;
  const base = new Date(date);
  if (isNaN(base)) return null;

  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    const fallback = new Date(`${date} ${time}`);
    return isNaN(fallback) ? null : fallback;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  base.setHours(hours, minutes, 0, 0);

  return base;
};

const isCancelable = (booking) => {
  if (!booking || booking.status !== "Confirmed") return false;
  const scheduled = parseShowDateTime(booking.date, booking.time);
  if (!scheduled) return false;
  return scheduled.getTime() - Date.now() > 1000 * 60 * 60;
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expandedId, setExpandedId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const userName = localStorage.getItem("username") || "User";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access');
        if (!token) {
          throw new Error('Authentication required to load bookings');
        }

        const response = await API.get('/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookings(response.data.bookings || []);
      } catch (fetchError) {
        console.error('Failed to load bookings:', fetchError);
        setError('Unable to load bookings at the moment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const bookingId = searchParams.get("id");
  const visibleBookings = bookingId
    ? bookings.filter((b) => b.id === bookingId)
    : bookings;

  const handleCancel = async (bookingId) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking || !isCancelable(booking)) return;

    setCancelingId(bookingId);
    setError(null);
    try {
      const token = localStorage.getItem('access');
      await API.put(
        `/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings((prev) =>
        prev.map((item) =>
          item.id === bookingId ? { ...item, status: 'Canceled' } : item
        )
      );
    } catch (cancelError) {
      console.error('Canceling booking failed:', cancelError);
      setError(
        cancelError?.response?.data?.error ||
          'Failed to cancel the booking. Please try again.'
      );
    } finally {
      setCancelingId(null);
    }
  };

  const totalSpent = visibleBookings.reduce((s, b) => s + (b.total || 0), 0);
  const confirmedCount = visibleBookings.filter((b) => b.status === "Confirmed").length;

  return (
    <main className="mb-page">
      <div className="mb-page-header">
        <div>
          <h1 className="mb-page-title">My Bookings</h1>
          <p className="mb-page-sub">All your tickets, organized in one place.</p>
        </div>
        <button type="button" className="mb-browse-btn" onClick={() => navigate("/events")}>
          + Book More
        </button>
      </div>

      <div className="mb-stats">
        <div className="mb-stat">
          <span className="mb-stat__value">{visibleBookings.length}</span>
          <span className="mb-stat__label">Total Bookings</span>
        </div>
        <div className="mb-stat-divider" />
        <div className="mb-stat">
          <span className="mb-stat__value">{confirmedCount}</span>
          <span className="mb-stat__label">Confirmed</span>
        </div>
        <div className="mb-stat-divider" />
        <div className="mb-stat">
          <span className="mb-stat__value">Rs. {totalSpent.toLocaleString("en-IN")}</span>
          <span className="mb-stat__label">Total Spent</span>
        </div>
      </div>

      {loading ? (
        <div className="mb-loading">Loading your bookings...</div>
      ) : error ? (
        <div className="mb-error">
          <p>{error}</p>
          <button type="button" className="mb-browse-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : visibleBookings.length === 0 ? (
        <div className="mb-empty">
          <span className="mb-empty__icon">🎟️</span>
          <p className="mb-empty__text">No bookings yet. Start exploring!</p>
          <button type="button" className="mb-browse-btn" onClick={() => navigate("/events")}>
            Browse Events
          </button>
        </div>
      ) : (
        <div className="mb-grid">
          {visibleBookings.map((b) => {
            const sm = STATUS_META[b.status] || STATUS_META.Confirmed;
            const catIcon = getCategoryIcon(b.event?.name);
            const isExpanded = expandedId === b.id;
            const ticketLink = buildTicketPath({
              id: b.id,
              userName,
              eventName: b.event?.name,
              city: b.event?.city,
              venue: b.event?.venue,
              date: b.date,
              time: b.time,
              seats: b.seats,
              amount: b.total,
              method: b.method,
              transactionId: b.transactionId,
              receiptId: b.receiptId,
              status: b.status,
              category: b.event?.category,
            });
            const qrValue = getTicketUrl({
              id: b.id,
              userName,
              eventName: b.event?.name,
              city: b.event?.city,
              venue: b.event?.venue,
              date: b.date,
              time: b.time,
              seats: b.seats,
              amount: b.total,
              method: b.method,
              transactionId: b.transactionId,
              receiptId: b.receiptId,
              status: b.status,
              category: b.event?.category,
            });
            const cancelable = isCancelable(b);

            return (
              <div key={b.id} className={`mb-card${isExpanded ? " mb-card--expanded" : ""}`}>
                <div className="mb-card__body">
                  <div className="mb-card__top">
                    <span className="mb-card__cat-icon">{catIcon}</span>
                    <div className="mb-card__title-block">
                      <p className="mb-card__event">{b.event?.name}</p>
                      <p className="mb-card__city">📍 {b.event?.city}</p>
                    </div>
                    <span className={`mb-status ${sm.cls}`}>
                      {sm.icon} {b.status}
                    </span>
                  </div>

                  <div className="mb-card__pills">
                    <span className="mb-pill">🗓 {b.date}</span>
                    <span className="mb-pill">🕐 {b.time}</span>
                    <span className="mb-pill">💺 {b.seats?.join(", ")}</span>
                    <span className="mb-pill">💳 {b.method}</span>
                  </div>

                  <div className="mb-card__footer">
                    <div>
                      <p className="mb-card__id">{b.id}</p>
                      <p className="mb-card__txn">Txn: {b.transactionId}</p>
                    </div>
                    <p className="mb-card__amount">Rs. {(b.total || 0).toLocaleString("en-IN")}</p>
                  </div>

                  {cancelable && (
                    <div className="mb-card__cancel-row">
                      <button
                        type="button"
                        className="mb-cancel-btn"
                        disabled={cancelingId === b.id}
                        onClick={() => handleCancel(b.id)}
                      >
                        {cancelingId === b.id ? "Canceling..." : "Cancel Ticket"}
                      </button>
                      <span className="mb-cancel-note">Cancel up to 1 hour before showtime.</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="mb-card__toggle"
                    onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  >
                    {isExpanded ? "Hide QR ▲" : "Show QR & Details ▼"}
                  </button>

                  {isExpanded && (
                    <div className="mb-card__detail">
                      <div className="mb-qr-box">
                        <QRCodeCanvas value={qrValue} size={100} fgColor="#7f1d1d" />
                        <p className="mb-qr-label">Scan to open ticket</p>
                      </div>
                      <div className="mb-detail-rows">
                        <div className="mb-detail-row">
                          <span>Receipt ID</span>
                          <strong>{b.receiptId}</strong>
                        </div>
                        <div className="mb-detail-row">
                          <span>Transaction</span>
                          <strong>{b.transactionId}</strong>
                        </div>
                        <div className="mb-detail-row">
                          <span>Payment</span>
                          <strong>{b.method}</strong>
                        </div>
                        <div className="mb-detail-row">
                          <span>Seats</span>
                          <strong>{b.seats?.join(", ")}</strong>
                        </div>
                        <div className="mb-detail-row">
                          <span>Ticket Page</span>
                          <strong>
                            <button
                              type="button"
                              className="mb-browse-btn"
                              onClick={() => navigate(ticketLink)}
                            >
                              Open & Download
                            </button>
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}