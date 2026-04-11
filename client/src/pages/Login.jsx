// Commented out: Login functionality is disabled
// 
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import API from "../services/api";
// import google from "../assets/google.png";
// import apple from "../assets/apple.png";
// import "../css/Login.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import google from "../assets/google.png";
import apple from "../assets/apple.png";
import "../css/Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  // Load remembered username on mount
  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setForm((prev) => ({ ...prev, username: rememberedUsername }));
      setRemember(true);
    }
  }, []);

  const login = async () => {
    if (!form.username || !form.password) {
      return toast.error("Please enter your username/email and password.");
    }
    try {
      setLoading(true);
      const res = await API.post("/auth/login/", form);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("username", res.data.username || form.username);
      
      // Save username if remember me is checked
      if (remember) {
        localStorage.setItem("rememberedUsername", form.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }
      
      toast.success("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRememberChange = (checked) => {
    setRemember(checked);
    if (!checked) {
      localStorage.removeItem("rememberedUsername");
    } else if (form.username) {
      localStorage.setItem("rememberedUsername", form.username);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-page__overlay" />

      <div className="auth-card auth-card--login">
        <div className="auth-card__brand">
          <div className="auth-card__brand-mark">ST</div>
          <div>
            <div className="auth-card__brand-name">Smart Ticket</div>
            <div className="auth-card__brand-tagline">Booking &amp; Resale Platform</div>
          </div>
        </div>

        <h2 className="auth-card__title">Welcome back</h2>
        <p className="auth-card__subtitle">Sign in to continue booking your tickets</p>

        <div className="auth-card__field">
          <input
            className="auth-card__input"
            placeholder="Enter your username or email"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        <div className="auth-card__field">
          <div className="auth-card__input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              className="auth-card__input auth-card__input--with-toggle"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && login()}
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

        <div className="auth-card__options">
          <label className="auth-card__remember">
            <input
              className="auth-card__checkbox"
              type="checkbox"
              checked={remember}
              onChange={(e) => handleRememberChange(e.target.checked)}
            />
            Remember me
          </label>
          <button
            type="button"
            className="auth-card__link-button"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </button>
        </div>

        <button
          className="auth-card__button"
          onClick={login}
          disabled={loading}
        >
          {loading ? (
            <span className="auth-card__button-spinner">
              <span className="auth-card__spinner" />
              Please wait...
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="auth-card__divider">
          <div className="auth-card__divider-line" />
          <span className="auth-card__divider-text">or continue with</span>
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

        <p className="auth-card__footer">
          New user?{" "}
          <button
            type="button"
            className="auth-card__link-button"
            onClick={() => navigate("/signup")}
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
