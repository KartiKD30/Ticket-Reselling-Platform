import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await api.post('/auth/login/', form);
      const { access, username, role } = response.data;

      if (role !== 'organizer') {
        setError('This login is only for organizer accounts.');
        localStorage.removeItem('access');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        return;
      }

      localStorage.setItem('access', access);
      localStorage.setItem('username', username || form.username);
      localStorage.setItem('role', role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your organizer credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">Organizer</p>
          <h1 className="text-3xl font-bold mt-2">Sign in</h1>
          <p className="text-muted-foreground mt-2">
            Use your organizer account to manage events and approvals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Username or Email</label>
            <input
              type="text"
              value={form.username}
              onChange={handleChange('username')}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="organizer@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
