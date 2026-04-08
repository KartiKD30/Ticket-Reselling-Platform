function Footer() {
  return (
    <footer className="footer">
      <section className="footer-top">
        <div>
          <h2>Smart Ticket</h2>
          <p>
            Fast, secure, and reliable digital ticket booking for city and
            intercity travel.
          </p>
        </div>

        <div>
          <h3>Company</h3>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3>Booking</h3>
          <ul>
            <li><a href="#">Bus Tickets</a></li>
            <li><a href="#">Train Tickets</a></li>
            <li><a href="#">Group Booking</a></li>
          </ul>
        </div>

        <div>
          <h3>Help</h3>
          <ul>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Refund Policy</a></li>
            <li><a href="#">Terms and Privacy</a></li>
          </ul>
        </div>
      </section>

      <section className="footer-bottom">
        <p>© 2026 Smart Ticket Booking System. All rights reserved.</p>
        <div className="footer-socials">
          <a href="#">Facebook</a>
          <a href="#">LinkedIn</a>
          <a href="#">Instagram</a>
        </div>
      </section>
    </footer>
  )
}

export default Footer
