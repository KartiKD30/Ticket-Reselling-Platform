import { useState } from 'react'
import API from '../services/api'
import '../css/Help.css'

const helpTopics = [
  {
    icon: '🎟️',
    title: 'Booking & Payments',
    desc: 'Ticket booking, failed payments, duplicate charges, and receipts.',
  },
  {
    icon: '🪑',
    title: 'Seat Selection',
    desc: 'Seat availability, locked seats, and best-seat suggestions.',
  },
  {
    icon: '🔁',
    title: 'Cancellation & Refund',
    desc: 'Cancellation eligibility, timelines, and refund status checks.',
  },
  {
    icon: '🏷️',
    title: 'Resale Requests',
    desc: 'Resale request status, admin approval, and rejected requests.',
  },
]

const faqItems = [
  {
    q: 'How long does resale approval take?',
    a: 'Resale requests are reviewed by admin. Most approvals are completed within 24 hours.',
  },
  {
    q: 'Why can’t I cancel my booking?',
    a: 'Cancellation is allowed only for confirmed tickets and only before the cut-off window for the event.',
  },
  {
    q: 'Where can I find my ticket QR code?',
    a: 'Open My Bookings and choose the ticket card to view QR and booking details.',
  },
  {
    q: 'What if payment succeeds but booking is missing?',
    a: 'Use the Retry option on My Bookings once. If it still does not appear, contact support with your transaction ID.',
  },
]

export default function Help() {
  const [openIndex, setOpenIndex] = useState(0)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Other',
    bookingId: '',
    message: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTicketForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRaiseTicket = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitMessage('')

    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      setSubmitError('Please fill in subject and issue details.')
      return
    }

    const token = localStorage.getItem('access')
    if (!token) {
      setSubmitError('Please login to raise a support ticket.')
      return
    }

    setSubmitting(true)
    try {
      const response = await API.post(
        '/support/tickets',
        {
          subject: ticketForm.subject.trim(),
          category: ticketForm.category,
          bookingId: ticketForm.bookingId.trim(),
          message: ticketForm.message.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setSubmitMessage(response.data?.message || 'Ticket raised successfully. Waiting for admin team.')
      setTicketForm({
        subject: '',
        category: 'Other',
        bookingId: '',
        message: '',
      })
    } catch (error) {
      console.error('Failed to raise support ticket:', error)
      setSubmitError(error?.response?.data?.error || 'Failed to raise ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="help-page">
      <section className="help-hero">
        <div>
          <p className="help-kicker">Support Center</p>
          <h1 className="help-title">How can we help you today?</h1>
          <p className="help-subtitle">
            Find quick answers for booking, resale approval, payments, and ticket management.
          </p>
        </div>
        <div className="help-hero__chips">
          <span>24x7 Guidance</span>
          <span>Fast Resolution</span>
          <span>Ticket Safety</span>
        </div>
      </section>

      <section className="help-topic-grid" aria-label="Help topics">
        {helpTopics.map((topic) => (
          <article key={topic.title} className="help-topic-card">
            <div className="help-topic-card__icon" aria-hidden="true">{topic.icon}</div>
            <h2>{topic.title}</h2>
            <p>{topic.desc}</p>
          </article>
        ))}
      </section>

      <section className="help-faq" aria-label="Frequently asked questions">
        <div className="help-faq__head">
          <h2>Frequently Asked Questions</h2>
          <p>Common issues and instant answers.</p>
        </div>

        <div className="help-faq__list">
          {faqItems.map((item, index) => {
            const open = openIndex === index
            return (
              <article key={item.q} className={`help-faq-item${open ? ' open' : ''}`}>
                <button
                  type="button"
                  className="help-faq-item__question"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  aria-expanded={open}
                >
                  <span>{item.q}</span>
                  <span className="help-faq-item__arrow">▾</span>
                </button>
                {open && <p className="help-faq-item__answer">{item.a}</p>}
              </article>
            )
          })}
        </div>
      </section>

      <section className="help-contact" aria-label="Contact support section">
        <div className="help-contact__card">
          <h3>Need more help?</h3>
          <p>Our support team is here to assist you with account, booking, and resale issues.</p>
          <div className="help-contact__actions">
            <button type="button">Chat with Support</button>
            <button
              type="button"
              className="help-btn-secondary"
              onClick={() => setShowTicketForm((prev) => !prev)}
            >
              {showTicketForm ? 'Hide Ticket Form' : 'Raise a Ticket'}
            </button>
          </div>

          {showTicketForm && (
            <form className="help-ticket-form" onSubmit={handleRaiseTicket}>
              <div className="help-ticket-form__row">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Example: Resale request still pending"
                  value={ticketForm.subject}
                  onChange={handleInputChange}
                />
              </div>

              <div className="help-ticket-form__row help-ticket-form__row--inline">
                <div>
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={ticketForm.category}
                    onChange={handleInputChange}
                  >
                    <option value="Booking">Booking</option>
                    <option value="Payment">Payment</option>
                    <option value="Refund">Refund</option>
                    <option value="Resale">Resale</option>
                    <option value="Account">Account</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bookingId">Booking ID (optional)</label>
                  <input
                    id="bookingId"
                    name="bookingId"
                    type="text"
                    placeholder="Example: 6809b..."
                    value={ticketForm.bookingId}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="help-ticket-form__row">
                <label htmlFor="message">Issue Details</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Describe your issue with as much detail as possible."
                  value={ticketForm.message}
                  onChange={handleInputChange}
                />
              </div>

              {submitError && <p className="help-ticket-form__error">{submitError}</p>}
              {submitMessage && <p className="help-ticket-form__success">{submitMessage}</p>}

              <button type="submit" className="help-ticket-form__submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
