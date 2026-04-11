import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import "../css/Login.css";
import "../css/Signup.css";

function AuthSignup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const getValidationMessage = (err, fallback) => {
    const details = err.response?.data?.details;
    if (Array.isArray(details) && details.length > 0) {
      return details.map((item) => item.msg).join(" ");
    }
    return err.response?.data?.error || err.response?.data?.message || fallback;
  };

  const register = async () => {
    if (!form.username || !form.email || !form.password) {
      setError("Please enter username, email, and password.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setLoading(true);
      const endpoint = role === "organizer" ? "/auth/organizer/signup/" : "/auth/signup/";
      await API.post(endpoint, {
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setMessage("OTP sent successfully to your email");
      toast.success("OTP sent successfully to your email");
      setTimeout(() => setStep(2), 600);
    } catch (err) {
      setError(getValidationMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (form.otp.length !== 6) {
      setError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setLoading(true);
      const res = await API.post("/auth/verify-otp/", {
        username: form.username,
        otp: form.otp,
      });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("username", res.data.username || form.username);
      localStorage.setItem("role", res.data.role || "user");
      setMessage("Verification successful. Redirecting...");
      toast.success("Signup verified!");
      if ((res.data.role || role) === "organizer") {
        setTimeout(() => {
          window.location.href = "http://localhost:5174";
        }, 700);
        return;
      }
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page auth-shell">
      <div className="auth-shell__panel auth-shell__panel--wide">
        <div className="auth-shell__brand">Smart Ticket</div>
        <h2>{step === 1 ? "Create Account" : "Verify Email"}</h2>
        <p>
          {step === 1
            ? `Join our platform as ${role === "organizer" ? "an organizer" : "a user"}`
            : `Enter the 6-digit code sent to ${form.email}`}
        </p>

        <div className="tabs" aria-label="Account type">
          <button
            type="button"
            className={`tab ${role === "user" ? "active" : ""}`}
            onClick={() => {
              setRole("user");
              setError("");
              setMessage("");
            }}
            disabled={step === 2}
          >
            User
          </button>
          <button
            type="button"
            className={`tab ${role === "organizer" ? "active" : ""}`}
            onClick={() => {
              setRole("organizer");
              setError("");
              setMessage("");
            }}
            disabled={step === 2}
          >
            Organizer
          </button>
        </div>

        {step === 1 ? (
          <>
            <input placeholder="Username" value={form.username} onChange={updateForm("username")} />
            <input type="email" placeholder="Email Address" value={form.email} onChange={updateForm("email")} />
            <input placeholder="Phone Number" value={form.phone} onChange={updateForm("phone")} />
            <input
              type="password"
              placeholder="Create Password"
              value={form.password}
              onChange={updateForm("password")}
              onKeyDown={(event) => event.key === "Enter" && register()}
            />
            <button className="auth-submit" type="button" onClick={register} disabled={loading}>
              {loading ? "Processing..." : "Register"}
            </button>
          </>
        ) : (
          <>
            <input
              className="otp-input"
              maxLength="6"
              placeholder="------"
              value={form.otp}
              onChange={(event) =>
                setForm({ ...form, otp: event.target.value.replace(/\D/g, "").slice(0, 6) })
              }
              onKeyDown={(event) => event.key === "Enter" && verifyOtp()}
            />
            <button className="auth-submit" type="button" onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <div className="link" onClick={() => setStep(1)}>Back to Registration</div>
          </>
        )}

        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        <div className="link" onClick={() => navigate("/login")}>
          Already have an account? Login
        </div>
        <div className="link link--muted" onClick={() => navigate("/login")}>
          Admin Access? Click here to Login
        </div>
      </div>
    </div>
  );
}

export default AuthSignup;
