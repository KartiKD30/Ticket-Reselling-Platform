import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import "../css/Login.css";

function AuthLogin() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setForm((current) => ({ ...current, identifier: rememberedUsername }));
      setRemember(true);
    }
  }, []);

  const setAccountType = (nextRole) => {
    setRole(nextRole);
    setError("");
  };

  const login = async () => {
    if (!form.identifier || !form.password) {
      setError("Please enter your username/email and password.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const endpoint = role === "admin" ? "/auth/admin/login" : "/auth/login/";
      const res = await API.post(endpoint, {
        username: form.identifier,
        password: form.password,
      });

      const returnedRole = res.data.role || role;
      if (role !== "admin" && returnedRole !== role) {
        setError(`This login is only for ${role} accounts.`);
        return;
      }

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("username", res.data.username || form.identifier);
      localStorage.setItem("role", returnedRole);

      if (remember) {
        localStorage.setItem("rememberedUsername", form.identifier);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      toast.success("Login successful! Redirecting...");

      if (returnedRole === "admin") {
        window.location.href = "http://localhost:3001";
        return;
      }

      if (returnedRole === "organizer") {
        window.location.href = "http://localhost:3002";
        return;
      }

      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page auth-shell">
      <div className="auth-shell__panel">
        <div className="auth-shell__brand">Smart Ticket</div>
        <h2>Welcome Back</h2>
        <p>Login to your account to continue</p>

        <div className="tabs" role="tablist" aria-label="Account type">
          {["user", "organizer", "admin"].map((item) => (
            <button
              key={item}
              type="button"
              className={`tab ${role === item ? "active" : ""}`}
              onClick={() => setAccountType(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Username or email"
          value={form.identifier}
          onChange={(event) => setForm({ ...form, identifier: event.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          onKeyDown={(event) => event.key === "Enter" && login()}
        />

        <div className="auth-options">
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />{" "}
            Remember me
          </label>
          <button type="button" className="link-button" onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </button>
        </div>

        <button className="auth-submit" type="button" onClick={login} disabled={loading}>
          {loading ? "Processing..." : "Login"}
        </button>

        {error && <div className="message error">{error}</div>}

        {role !== "admin" && (
          <div className="link" onClick={() => navigate("/signup")}>
            Don't have an account? Register
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthLogin;
