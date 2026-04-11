import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../services/api";
import {
  getTicketDateTimeLabel,
  normalizeTicketData,
} from "../utils/ticket";
import "../css/TicketPreview.css";

const getTicketFromSearchParams = (id, searchParams) =>
  normalizeTicketData({
    id,
    userName: searchParams.get("userName"),
    eventName: searchParams.get("eventName"),
    city: searchParams.get("city"),
    venue: searchParams.get("venue"),
    date: searchParams.get("date"),
    time: searchParams.get("time"),
    seats: searchParams.get("seats"),
    amount: searchParams.get("amount"),
    method: searchParams.get("method"),
    transactionId: searchParams.get("transactionId"),
    receiptId: searchParams.get("receiptId"),
    status: searchParams.get("status"),
    category: searchParams.get("category"),
    eventDate: searchParams.get("eventDate"),
  });

export default function TicketPreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [ticket, setTicket] = useState(() => getTicketFromSearchParams(id, searchParams));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ticketText = [
    `Ticket Holder: ${ticket.userName || "Guest User"}`,
    `Booking ID: ${ticket.id || "TBD"}`,
    `Event: ${ticket.eventName || "Event Ticket"}`,
    `Venue: ${ticket.venue || ticket.city || "Venue will be shared at entry"}`,
    `Date & Time: ${getTicketDateTimeLabel(ticket)}`,
    `Seats: ${ticket.seats.length ? ticket.seats.join(", ") : "General Entry"}`,
    `Amount Paid: Rs. ${(ticket.amount || 0).toLocaleString("en-IN")}`,
    `Payment Method: ${ticket.method || "Online"}`,
    `Category: ${ticket.category || "Standard"}`,
    `Transaction ID: ${ticket.transactionId || "Not available"}`,
    `Receipt ID: ${ticket.receiptId || "Not available"}`,
    `Status: ${ticket.status || "Confirmed"}`,
  ].join("\n");

  useEffect(() => {
    const fetchTicket = async () => {
      const token = localStorage.getItem("access");
      if (!token || !id || id === "preview") {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await API.get(`/bookings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const booking = response.data?.booking;
        if (!booking) {
          throw new Error("Ticket not found");
        }

        setTicket((current) =>
          normalizeTicketData({
            ...current,
            id: booking.id || booking._id || id,
            userName: current.userName || localStorage.getItem("username") || "",
            eventName: booking.event?.name,
            city: booking.event?.city,
            venue: booking.event?.venue,
            date: booking.date,
            time: booking.time,
            seats: booking.seats,
            amount: booking.total,
            method: booking.method,
            transactionId: booking.transactionId,
            receiptId: booking.receiptId,
            status: booking.status,
            category: booking.event?.category,
            eventDate: booking.date,
          })
        );
      } catch (fetchError) {
        console.error("Failed to load ticket:", fetchError);
        if (!ticket.eventName) {
          setError("Unable to load the ticket details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, ticket.eventName]);

  if (loading && !ticket.eventName) {
    return <main className="ticket-preview-page"><div className="ticket-preview-empty">Loading ticket...</div></main>;
  }

  if (error && !ticket.eventName) {
    return (
      <main className="ticket-preview-page">
        <div className="ticket-preview-empty">
          <p>{error}</p>
          <button type="button" className="ticket-preview-btn ticket-preview-btn--primary" onClick={() => navigate("/bookings")}>
            Back to Bookings
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="ticket-preview-page">
      <section className="ticket-preview-shell">
        <div className="ticket-preview-head">
          <div>
            <p className="ticket-preview-kicker">Smart Ticket Pass</p>
            <h1 className="ticket-preview-title">Digital Entry Ticket</h1>
            <p className="ticket-preview-subtitle">Scan-ready ticket details.</p>
          </div>
          <div className="ticket-preview-actions">
            <button type="button" className="ticket-preview-btn ticket-preview-btn--secondary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>

        {error && <p className="ticket-preview-error">{error}</p>}

        <article className="ticket-preview-card">
          <div className="ticket-preview-card__hero">
            <div>
              <p className="ticket-preview-card__label">Admit One</p>
              <h2 className="ticket-preview-card__event">{ticket.eventName || "Event Ticket"}</h2>
              <p className="ticket-preview-card__venue">{ticket.venue || ticket.city || "Venue will be shared at entry"}</p>
            </div>
            <span className="ticket-preview-status">{ticket.status || "Confirmed"}</span>
          </div>

          <div className="ticket-preview-grid">
            <div className="ticket-preview-item">
              <span>Ticket Holder</span>
              <strong>{ticket.userName || "Guest User"}</strong>
            </div>
            <div className="ticket-preview-item">
              <span>Booking ID</span>
              <strong>{ticket.id || "TBD"}</strong>
            </div>
            <div className="ticket-preview-item">
              <span>Date & Time</span>
              <strong>{getTicketDateTimeLabel(ticket)}</strong>
            </div>
            <div className="ticket-preview-item">
              <span>Seats</span>
              <strong>{ticket.seats.length ? ticket.seats.join(", ") : "General Entry"}</strong>
            </div>
            <div className="ticket-preview-item">
              <span>Amount Paid</span>
              <strong>Rs. {(ticket.amount || 0).toLocaleString("en-IN")}</strong>
            </div>
            <div className="ticket-preview-item">
              <span>Payment Method</span>
              <strong>{ticket.method || "Online"}</strong>
            </div>
            <div className="ticket-preview-item">
              <span>Category</span>
              <strong>{ticket.category || "Standard"}</strong>
            </div>
            <div className="ticket-preview-item">
              <span>Transaction ID</span>
              <strong>{ticket.transactionId || "Not available"}</strong>
            </div>
            <div className="ticket-preview-item">
              <span>Receipt ID</span>
              <strong>{ticket.receiptId || "Not available"}</strong>
            </div>
          </div>

          <div className="ticket-preview-card__footer">
            <div>
              <p className="ticket-preview-card__note">Present this ticket at entry. QR scans open this ticket view directly.</p>
            </div>
            <div className="ticket-preview-card__stamp">Valid Pass</div>
          </div>
        </article>

        <section className="ticket-preview-text" aria-label="Ticket details text">
          <h2 className="ticket-preview-text__title">Ticket Details (Text Format)</h2>
          <pre className="ticket-preview-text__content">{ticketText}</pre>
        </section>
      </section>
    </main>
  );
}