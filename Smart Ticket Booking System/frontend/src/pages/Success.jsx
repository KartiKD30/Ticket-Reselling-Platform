import { useLocation, useNavigate } from "react-router-dom";
import "../css/Success.css";

export default function Success() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const bookingId = state?.bookingId || `TK-${Math.floor(1000 + Math.random() * 9000)}`;
  const eventName = state?.event?.name || "Unknown Event";
  const amount = (state?.total || 0).toLocaleString("en-IN");
  const seats = Array.isArray(state?.seats) ? state.seats.join(", ") : state?.seats || "-";
  const transactionId = state?.transactionId || "Generating...";
  const receiptId = state?.receiptId || `REC-${Math.floor(100000 + Math.random() * 900000)}`;
  const paymentMethod = state?.method || "Online";
  const bookedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="success-page">
      <section className="success-shell">
        <div className="success-banner">
          <div className="success-icon" aria-hidden="true">✓</div>
          <div>
            <p className="success-tag">Payment Successful</p>
            <h1 className="success-title">Booking Confirmed!</h1>
            <p className="success-sub">Your tickets are reserved and ready.</p>
          </div>
        </div>

        {state && (
          <div className="success-layout">
            <article className="success-ticket" aria-label="Ticket summary">
              <div className="success-ticket__head">
                <p className="success-ticket__label">E-Ticket</p>
                <span className="success-pill">Confirmed</span>
              </div>

              <h2 className="success-ticket__event">{eventName}</h2>

              <div className="success-ticket__meta-grid">
                <div className="success-meta-box">
                  <span>Seats</span>
                  <strong>{seats}</strong>
                </div>
                <div className="success-meta-box">
                  <span>Date</span>
                  <strong>{state?.date || state?.event?.date || "TBD"}</strong>
                </div>
                <div className="success-meta-box">
                  <span>Time</span>
                  <strong>{state?.time || "TBD"}</strong>
                </div>
                <div className="success-meta-box">
                  <span>Amount Paid</span>
                  <strong>Rs. {amount}</strong>
                </div>
                <div className="success-meta-box">
                  <span>Payment</span>
                  <strong>{paymentMethod}</strong>
                </div>
                <div className="success-meta-box">
                  <span>Booked On</span>
                  <strong>{bookedAt}</strong>
                </div>
              </div>

              <div className="success-divider" />

              <div className="success-ticket__ids">
                <div>
                  <span>Booking ID</span>
                  <strong>{bookingId}</strong>
                </div>
                <div>
                  <span>Transaction ID</span>
                  <strong>{transactionId}</strong>
                </div>
                <div>
                  <span>Receipt ID</span>
                  <strong>{receiptId}</strong>
                </div>
              </div>
            </article>

            <aside className="success-info" aria-label="Next steps">
              <h3>What happens next?</h3>
              <ul className="success-steps">
                <li>Your booking is now confirmed.</li>
                <li>Ticket details are available in My Bookings.</li>
                <li>Carry booking ID or receipt at entry.</li>
              </ul>

              <div className="success-support">
                <p>Need help?</p>
                <span>Support available 24x7</span>
              </div>
            </aside>
          </div>
        )}

        {!state && (
          <div className="success-no-data">
            <p>Booking details are unavailable, but your payment appears successful.</p>
          </div>
        )}

        <div className="success-actions">
          <button
            type="button"
            className="success-btn success-btn--primary"
            onClick={() => navigate(`/bookings?id=${bookingId}`)}
          >
            View My Bookings
          </button>
          <button
            type="button"
            className="success-btn success-btn--secondary"
            onClick={() => navigate("/events")}
          >
            Browse More Events
          </button>
          <button
            type="button"
            className="success-btn success-btn--ghost"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </section>
    </main>
  );
}
