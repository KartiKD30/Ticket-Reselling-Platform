import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import { offersData, getOfferByCode, isOfferValid, calculateDiscount } from "../data/offers";
import "../css/Payment.css";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [bank, setBank] = useState("");
  const [saveDetails, setSaveDetails] = useState(false);
  const [formError, setFormError] = useState("");
  const [paying, setPaying] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountDescription, setDiscountDescription] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showAvailableOffers, setShowAvailableOffers] = useState(false);

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) return;

      const response = await API.get("/wallet/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWalletBalance(response.data.wallet?.balance || 0);
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  };

  if (!state) return <p>No booking data found.</p>;

  const { event, seats, total, date } = state;
  const eventName = event?.name || "Unknown Event";
  const eventCity = event?.city || "Unknown City";
  const showDate = date || event?.date || "TBD";
  const seatCount = Array.isArray(seats) ? seats.length : 1;
  const subTotal = total || 0;
  const convenienceFee = Math.round(subTotal * 0.02);
  const gst = Math.round((subTotal + convenienceFee) * 0.05);
  const baseAmount = subTotal + convenienceFee + gst;

  // Calculate discount (e.g., 5% on base amount)
  let couponDiscount = 0;
  let couponDescription = "";
  if (appliedCoupon) {
    couponDiscount = calculateDiscount(appliedCoupon, baseAmount);
    couponDescription = appliedCoupon.title;
  }

  // Calculate wallet deduction
  const maxWalletDeduction = useWallet ? Math.min(walletAmount, walletBalance) : 0;
  
  // Final amount after coupon discount and wallet
  const finalAmount = Math.max(0, baseAmount - couponDiscount - maxWalletDeduction);

  const normalizedCard = cardNo.replace(/\s+/g, "").replace(/\D/g, "");
  const upiValid = /^[A-Za-z0-9._-]{2,}@[A-Za-z]{2,}$/.test(upiId.trim());
  const cardValid =
    normalizedCard.length === 16 &&
    /^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry) &&
    /^\d{3}$/.test(cvv);
  const netBankingValid = bank.trim().length > 0;

  const canPay =
    method === "upi"
      ? upiValid
      : method === "card"
        ? cardValid
        : netBankingValid;

  const maskedCard = normalizedCard
    ? `**** **** **** ${normalizedCard.slice(-4)}`
    : "**** **** **** ****";

  const formatCardNo = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleWalletToggle = (e) => {
    setUseWallet(e.target.checked);
    if (e.target.checked) {
      setWalletAmount(Math.min(walletBalance, baseAmount - calculatedDiscount));
    } else {
      setWalletAmount(0);
    }
  };

  const handleWalletAmountChange = (e) => {
    const amount = Math.min(
      Number(e.target.value) || 0,
      walletBalance,
      baseAmount - couponDiscount
    );
    setWalletAmount(amount);
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const offer = getOfferByCode(couponCode.trim());
    
    if (!offer) {
      toast.error("Invalid coupon code");
      setCouponCode("");
      return;
    }

    if (!isOfferValid(offer)) {
      toast.error("This coupon has expired");
      setCouponCode("");
      return;
    }

    setAppliedCoupon(offer);
    setCouponCode("");
    toast.success(`${offer.title} applied!`);
  };

  const applyQuickCoupon = (offer) => {
    setAppliedCoupon(offer);
    setCouponCode("");
    toast.success(`${offer.title} applied!`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!canPay) {
      setFormError("Please complete valid payment details to continue.");
      return;
    }

    setPaying(true);

    const bookingId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `TXN${Date.now()}`;
    const receiptId = `RCPT${Math.floor(100000 + Math.random() * 900000)}`;

    const token = localStorage.getItem('access');
    if (!token) {
      setFormError('Please sign in to complete payment.');
      setPaying(false);
      return;
    }

    try {
      const payload = {
        event: {
          id: state.event?.id,
          name: eventName,
          city: eventCity,
          venue: state.event?.venue,
          date: showDate,
          category: state.event?.category,
          price: state.unitPrice || state.event?.price,
        },
        date: showDate,
        seats: Array.isArray(state.seats) ? state.seats : [state.seats],
        total: finalAmount,
        time: state.time || "TBD",
        method: method === "upi" ? "UPI" : method === "card" ? "Card" : "Net Banking",
        transactionId,
        receiptId,
        status: "Confirmed",
        discountApplied: couponDiscount,
        discountDescription: couponDescription || `Coupon: ${appliedCoupon?.code || ''}`,
        walletDeducted: maxWalletDeduction,
      };

      const response = await API.post("/bookings", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const backendBookingId = response.data.booking?.id || bookingId;

      toast.success("Payment successful!");
      navigate("/success", {
        state: {
          ...state,
          bookingId: backendBookingId,
          total: finalAmount,
          method: payload.method,
          transactionId,
          receiptId,
          booking: response.data.booking,
          saveDetails,
          discountApplied: couponDiscount,
          discountDescription: couponDescription || `Coupon: ${appliedCoupon?.code || ''}`,
          walletDeducted: maxWalletDeduction,
        },
      });
    } catch (error) {
      console.error('Booking API error:', error);
      setFormError(
        error.response?.data?.error || 'Payment failed. Please try again.'
      );
    } finally {
      setPaying(false);
    }
  };

  return (
    <main className="payment-page">
      <div className="payment-layout">
        <section className="payment-box">
          <div className="payment-head">
            <h1 className="payment-title">Complete Payment</h1>
            <span className="payment-secure-badge">256-bit Secure Checkout</span>
          </div>

          <div className="payment-summary">
            <p className="payment-summary__event">{eventName}</p>
            <p className="payment-summary__seats">
              Seats: {Array.isArray(seats) ? seats.join(", ") : seats}
            </p>
            <p className="payment-summary__meta">Tickets: {seatCount}</p>
            <p className="payment-summary__meta">Date: {showDate}</p>
          </div>

          {/* Wallet Section */}
          {walletBalance > 0 && (
            <div className="payment-wallet-section">
              <div className="payment-wallet-header">
                <h3>💰 Your Wallet</h3>
                <span className="payment-wallet-balance">Balance: Rs. {walletBalance.toLocaleString("en-IN")}</span>
              </div>
              <label className="payment-check">
                <input
                  type="checkbox"
                  checked={useWallet}
                  onChange={handleWalletToggle}
                />
                Use wallet balance for this booking
              </label>
              {useWallet && (
                <div className="payment-field">
                  <label htmlFor="walletAmount">Amount to use from wallet</label>
                  <input
                    id="walletAmount"
                    type="number"
                    min="0"
                    max={Math.min(walletBalance, baseAmount - couponDiscount)}
                    value={walletAmount}
                    onChange={handleWalletAmountChange}
                  />
                  <small className="payment-hint">
                    Maximum: Rs. {Math.min(walletBalance, baseAmount - couponDiscount).toLocaleString("en-IN")}
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Coupon Section */}
          <div className="payment-coupon-section">
            <div className="payment-coupon-header">
              <h3>🎟️ Apply Coupon Code</h3>
              {appliedCoupon && (
                <span className="payment-coupon-active">✓ {appliedCoupon.code}</span>
              )}
            </div>

            <div className="payment-coupon-input">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
              />
              <button
                type="button"
                className="payment-coupon-apply-btn"
                onClick={applyCoupon}
              >
                Apply
              </button>
              {appliedCoupon && (
                <button
                  type="button"
                  className="payment-coupon-remove-btn"
                  onClick={removeCoupon}
                  title="Remove coupon"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Available Offers */}
            <div className="payment-coupon-toggle">
              <button
                type="button"
                onClick={() => setShowAvailableOffers(!showAvailableOffers)}
                className="payment-offers-toggle-btn"
              >
                {showAvailableOffers ? '▼' : '▶'} View Available Offers ({offersData.filter(o => isOfferValid(o)).length})
              </button>
            </div>

            {showAvailableOffers && (
              <div className="payment-offers-list">
                {offersData.map((offer) => (
                  <button
                    key={offer.code}
                    type="button"
                    className={`payment-offer-item${appliedCoupon?.code === offer.code ? ' active' : ''}${!isOfferValid(offer) ? ' disabled' : ''}`}
                    onClick={() => isOfferValid(offer) && applyQuickCoupon(offer)}
                    disabled={!isOfferValid(offer)}
                  >
                    <span className="payment-offer-icon">{offer.icon}</span>
                    <div className="payment-offer-info">
                      <p className="payment-offer-title">{offer.title}</p>
                      <p className="payment-offer-code">{offer.code}</p>
                    </div>
                    <span className="payment-offer-discount">{offer.discount}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="payment-progress" aria-label="Payment steps">
            <span className="payment-progress__step payment-progress__step--active">1. Select Method</span>
            <span className="payment-progress__step payment-progress__step--active">2. Enter Details</span>
            <span className="payment-progress__step">3. Confirm</span>
          </div>

          <div className="payment-methods">
            {[
              { id: "upi", label: "UPI", icon: "📱" },
              { id: "card", label: "Card", icon: "💳" },
              { id: "netbanking", label: "Net Banking", icon: "🏦" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                className={`payment-method-btn${method === m.id ? " payment-method-btn--active" : ""}`}
                onClick={() => {
                  setMethod(m.id);
                  setFormError("");
                }}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <form className="payment-form" onSubmit={handlePay}>
            {method === "upi" && (
              <div className="payment-field">
                <label htmlFor="upi">UPI ID</label>
                <input
                  id="upi"
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                />
                <small className={`payment-hint${upiId && !upiValid ? " payment-hint--error" : ""}`}>
                  {upiId && !upiValid
                    ? "Enter valid UPI ID format, e.g. alex@okhdfcbank"
                    : "Instant payment via UPI apps"}
                </small>
              </div>
            )}

            {method === "card" && (
              <>
                <div className="payment-card-preview" aria-label="Card preview">
                  <p className="payment-card-preview__chip">CARD</p>
                  <p className="payment-card-preview__number">{maskedCard}</p>
                  <p className="payment-card-preview__name">Ticket Booking User</p>
                </div>

                <div className="payment-field">
                  <label htmlFor="cardNo">Card Number</label>
                  <input
                    id="cardNo"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNo}
                    onChange={(e) => setCardNo(formatCardNo(e.target.value))}
                    required
                  />
                </div>

                <div className="payment-field-row">
                  <div className="payment-field">
                    <label htmlFor="expiry">Expiry</label>
                    <input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      required
                    />
                  </div>
                  <div className="payment-field">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      id="cvv"
                      type="password"
                      placeholder="•••"
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      required
                    />
                  </div>
                </div>

                <small className={`payment-hint${cardNo && !cardValid ? " payment-hint--error" : ""}`}>
                  {cardNo && !cardValid
                    ? "Card details look incomplete or invalid"
                    : "Your card details are encrypted and secure"}
                </small>
              </>
            )}

            {method === "netbanking" && (
              <div className="payment-field">
                <label htmlFor="bank">Select Bank</label>
                <select
                  id="bank"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  required
                >
                  <option value="">-- Choose Bank --</option>
                  <option>SBI</option>
                  <option>HDFC</option>
                  <option>ICICI</option>
                  <option>Axis</option>
                  <option>Kotak</option>
                </select>
              </div>
            )}

            <label className="payment-check">
              <input
                type="checkbox"
                checked={saveDetails}
                onChange={(e) => setSaveDetails(e.target.checked)}
              />
              Save payment preference for faster checkout
            </label>

            {formError && <p className="payment-form-error">{formError}</p>}

            <button type="submit" className="payment-pay-btn" disabled={paying || !canPay}>
              {paying ? "Processing..." : `Pay Rs. ${finalAmount.toLocaleString("en-IN")}`}
            </button>
          </form>
        </section>

        <aside className="payment-order-box" aria-label="Order summary">
          <h2 className="payment-order-title">Order Summary</h2>
          <div className="payment-order-row">
            <span>Ticket Amount</span>
            <strong>Rs. {subTotal.toLocaleString("en-IN")}</strong>
          </div>
          <div className="payment-order-row">
            <span>Convenience Fee (2%)</span>
            <strong>Rs. {convenienceFee.toLocaleString("en-IN")}</strong>
          </div>
          <div className="payment-order-row">
            <span>GST (5%)</span>
            <strong>Rs. {gst.toLocaleString("en-IN")}</strong>
          </div>
          <div className="payment-order-row">
            <span>Subtotal</span>
            <strong>Rs. {baseAmount.toLocaleString("en-IN")}</strong>
          </div>
          {couponDiscount > 0 && appliedCoupon && (
            <div className="payment-order-row payment-order-row--discount">
              <span>{appliedCoupon.title} ({appliedCoupon.code})</span>
              <strong>-Rs. {couponDiscount.toLocaleString("en-IN")}</strong>
            </div>
          )}
          {maxWalletDeduction > 0 && (
            <div className="payment-order-row payment-order-row--discount">
              <span>Wallet Used</span>
              <strong>-Rs. {maxWalletDeduction.toLocaleString("en-IN")}</strong>
            </div>
          )}
          <div className="payment-order-row payment-order-row--total">
            <span>Total Payable</span>
            <strong>Rs. {finalAmount.toLocaleString("en-IN")}</strong>
          </div>

          <p className="payment-order-note">
            By continuing, you agree to our Terms and refund policy.
          </p>

          <div className="payment-trust">
            <span>Secure Payments</span>
            <span>Instant Confirmation</span>
            <span>24x7 Support</span>
          </div>
        </aside>
        </div>
    </main>
  );
}
