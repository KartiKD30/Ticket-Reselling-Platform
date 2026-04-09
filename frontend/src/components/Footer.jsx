function Footer() {
  return (
    <footer className="footer">
      <section className="footer-top">
        <div>
          <h2>Smart Ticket</h2>
          <p>
            Fast, secure, and seamless online booking for movies, premieres,
            and weekend shows.
          </p>
        </div>

        <div>
          <h3>Company</h3>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#partners">Cinema Partners</a></li>
            <li><a href="#news">Newsroom</a></li>
          </ul>
        </div>

        <div>
          <h3>Booking</h3>
          <ul>
            <li><a href="#now-showing">Now Showing</a></li>
            <li><a href="#advance-booking">Advance Booking</a></li>
            <li><a href="#premium-seats">Premium Seats</a></li>
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
