// Commented out: Signup functionality is disabled
// 
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import API from "../services/api";
// import google from "../assets/google.png";
// import apple from "../assets/apple.png";
// import "../css/Signup.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import google from "../assets/google.png";
import apple from "../assets/apple.png";
import "../css/Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const signup = async () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      return toast.error("Please fill in all fields.");
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) return toast.error("Please enter a valid email address.");
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    try {
      setLoading(true);
      await API.post("/auth/signup/", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      const details = err.response?.data?.details;
      const detailMessage = Array.isArray(details) && details.length > 0
        ? details.map((item) => item.msg).join(" ")
        : "";
      toast.error(detailMessage || err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!form.otp) return toast.error("Please enter the OTP sent to your email.");
    try {
      setLoading(true);
      const res = await API.post("/auth/verify-otp/", {
        username: form.username,
        otp: form.otp,
      });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("username", form.username);
      toast.success("Signup verified! Redirecting to login...");
      setTimeout(() => navigate("/login"), 500);
    } catch {
      toast.error("Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-page__overlay" />

      <div className="auth-card auth-card--signup">
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
            <span className="auth-card__step-label is-active">Your Details</span>
          </div>
          <div className="auth-card__step-line" />
          <div className="auth-card__step">
            <div className={`auth-card__step-dot ${step === 2 ? "is-active" : ""}`}>2</div>
            <span className={`auth-card__step-label ${step === 2 ? "is-active" : ""}`}>Verify Email</span>
          </div>
        </div>

        <h2 className="auth-card__title">{step === 1 ? "Create your account" : "Verify your email"}</h2>
        <p className="auth-card__subtitle">
          {step === 1
            ? "Join Smart Ticket and start booking in minutes"
            : `We sent a 6-digit OTP to ${form.email}`}
        </p>

        {step === 1 ? (
          <>
            <div className="auth-card__field">
              <input
                className="auth-card__input"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div className="auth-card__field">
              <input
                type="email"
                className="auth-card__input"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="auth-card__field">
              <div className="auth-card__input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-card__input auth-card__input--with-toggle"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="auth-card__toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="auth-card__field">
              <div className="auth-card__input-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="auth-card__input auth-card__input--with-toggle"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && signup()}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="auth-card__toggle"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              className="auth-card__button"
              onClick={signup}
              disabled={loading}
            >
              {loading ? (
                <span className="auth-card__button-spinner">
                  <span className="auth-card__spinner" />
                  Sending OTP...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="auth-card__divider">
              <div className="auth-card__divider-line" />
              <span className="auth-card__divider-text">or sign up with</span>
              <div className="auth-card__divider-line" />
            </div>

            <div className="auth-card__socials">
              <button type="button" className="auth-card__social">
                <img src={google} alt="Google" className="auth-card__social-icon" />
                Google
              </button>
              <button type="button" className="auth-card__social">
                <img src={apple} alt="Apple" className="auth-card__social-icon" />
                Apple
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="auth-card__hint">
              Didn&apos;t receive the email? Check spam or{" "}
              <button
                type="button"
                className="auth-card__link-button"
                onClick={() => {
                  setStep(1);
                }}
              >
                go back
              </button>
            </div>

            <div className="auth-card__field">
              <input
                className="auth-card__input auth-card__input--otp"
                placeholder="------"
                maxLength={6}
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                onKeyDown={(e) => e.key === "Enter" && verifyOTP()}
              />
            </div>

            <button
              className="auth-card__button"
              onClick={verifyOTP}
              disabled={loading}
            >
              {loading ? (
                <span className="auth-card__button-spinner">
                  <span className="auth-card__spinner" />
                  Verifying...
                </span>
              ) : (
                "Verify &amp; Continue"
              )}
            </button>
          </>
        )}

        <p className="auth-card__footer">
          Already have an account?{" "}
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

export default Signup;
