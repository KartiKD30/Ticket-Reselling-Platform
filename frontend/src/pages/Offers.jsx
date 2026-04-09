import { useState } from "react";
import { offersData } from "../data/offers";
import "../css/Dashboard.css";

export default function Offers() {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const formatOfferDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <main className="dashboard-page" aria-label="Offers page">
      <section className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Exclusive Offers</h1>
          <p className="dashboard-subtitle">All active event offers in one place.</p>
        </div>
        <span className="dashboard-pill">{offersData.length} active deals</span>
      </section>

      <section className="offers-section" aria-label="Exclusive offers">
        <div className="offers-grid">
          {offersData.map((offer) => (
            <div className={`offer-card offer-card--${offer.theme}`} key={offer.id}>
              <div className="offer-card__header">
                <span className="offer-card__icon">{offer.icon}</span>
                <div className="offer-card__badges">
                  {offer.isNew && <span className="offer-card__new-badge">NEW</span>}
                  <span className="offer-card__category">{offer.category}</span>
                </div>
              </div>

              <div className="offer-card__discount">{offer.discount}</div>
              <h3 className="offer-card__title">{offer.title}</h3>
              <p className="offer-card__desc">{offer.description}</p>

              <div className="offer-card__code-row">
                <div className="offer-card__code">
                  <span className="offer-card__code-label">COUPON</span>
                  <span className="offer-card__code-value">{offer.code}</span>
                </div>
                <button
                  className={`offer-card__copy-btn ${copiedCode === offer.code ? "offer-card__copy-btn--copied" : ""}`}
                  type="button"
                  onClick={() => handleCopy(offer.code)}
                  aria-label={`Copy coupon ${offer.code}`}
                >
                  {copiedCode === offer.code ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="offer-card__footer">
                <span className="offer-card__validity">Valid till {formatOfferDate(offer.validTill)}</span>
                <button className="offer-card__cta" type="button">Grab Deal</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
