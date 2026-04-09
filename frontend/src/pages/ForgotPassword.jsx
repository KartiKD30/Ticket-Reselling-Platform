import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import "../css/ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP + new password
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ otp: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const sendOTP = async () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email) return toast.error("Please enter your email address.");
    if (!emailOk) return toast.error("Please enter a valid email address.");
    try {
      setLoading(true);
      await API.post("/forgot-password/", { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!form.otp) return toast.error("Please enter the OTP.");
    if (!form.newPassword) return toast.error("Please enter a new password.");
    if (form.newPassword !== form.confirmPassword) return toast.error("Passwords do not match.");
    try {
      setLoading(true);
      await API.post("/reset-password/", {
        email,
        otp: form.otp,
        new_password: form.newPassword,
      });
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-page__overlay" />

      <div className="auth-card auth-card--forgot-password">
        <div className="auth-card__brand">
          <div className="auth-card__brand-mark">ST</div>
          <div>
            <div className="auth-card__brand-name">Smart Ticket</div>
            <div className="auth-card__brand-tagline">Booking &amp; Resale Platform</div>
          </div>
        </div>

        <div className="auth-card__steps">
          <div className="auth-card__step">
            <div className="auth-card__step-dot is-active">1</div>
            <span className="auth-card__step-label is-active">Verify Email</span>
          </div>
          <div className="auth-card__step-line" />
          <div className="auth-card__step">
            <div className={`auth-card__step-dot ${step === 2 ? "is-active" : ""}`}>2</div>
            <span className={`auth-card__step-label ${step === 2 ? "is-active" : ""}`}>Reset Password</span>
          </div>
        </div>

        <h2 className="auth-card__title">{step === 1 ? "Forgot your password?" : "Set new password"}</h2>
        <p className="auth-card__subtitle">
          {step === 1
            ? "Enter your registered email and we'll send you a reset OTP."
            : `Enter the OTP sent to ${email} and choose a new password.`}
        </p>

        {step === 1 ? (
          <>
            <div className="auth-card__field">
              <input
                type="email"
                className="auth-card__input"
                placeholder="Registered email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendOTP()}
              />
            </div>

            <button
              className="auth-card__button"
              onClick={sendOTP}
              disabled={loading}
            >
              {loading ? (
                <span className="auth-card__button-spinner">
                  <span className="auth-card__spinner" />
                  Sending OTP...
                </span>
              ) : (
                "Send OTP"
              )}
            </button>
          </>
        ) : (
          <>
            <div className="auth-card__field">
              <input
                className="auth-card__input auth-card__input--otp"
                placeholder="------"
                maxLength={6}
                value={form.otp}
                onChange={(e) =>
                  setForm({ ...form, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })
                }
              />
            </div>

            <div className="auth-card__field">
              <div className="auth-card__input-wrap">
                <input
                  type={showNew ? "text" : "password"}
                  className="auth-card__input auth-card__input--with-toggle"
                  placeholder="New password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="auth-card__toggle">
                  {showNew ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="auth-card__field">
              <div className="auth-card__input-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="auth-card__input auth-card__input--with-toggle"
                  placeholder="Confirm new password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && resetPassword()}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="auth-card__toggle">
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              className="auth-card__button"
              onClick={resetPassword}
              disabled={loading}
            >
              {loading ? (
                <span className="auth-card__button-spinner">
                  <span className="auth-card__spinner" />
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>

            <p className="auth-card__hint">
              Wrong email?{" "}
              <button
                type="button"
                className="auth-card__link-button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
              >
                Go back
              </button>
            </p>
          </>
        )}

        <p className="auth-card__footer">
          Remember your password?{" "}
          <button
            type="button"
            className="auth-card__link-button"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
