import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Shield, User } from 'lucide-react';
import './Auth.css';

export function Login() {
  const [role, setRole] = useState(null); // null | 'customer' | 'admin'
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { loginAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (role === 'customer') {
      const { data, error: err } = await supabase
        .from('customer')
        .select('*')
        .eq('customer_email', form.email.trim().toLowerCase());

      setLoading(false);
      if (err) { setError('Database error: ' + err.message); return; }
      if (!data || data.length === 0) { setError('No account found with that email.'); return; }
      if (data[0].customer_password !== form.password) { setError('Incorrect password.'); return; }
      login(data[0]);
      navigate('/');

    } else if (role === 'admin') {
      const { data, error: err } = await supabase
        .from('admin')
        .select('*')
        .eq('admin_email', form.email.trim().toLowerCase());

      setLoading(false);
      if (err) { setError('Database error: ' + err.message); return; }
      if (!data || data.length === 0) { setError('No admin account found.'); return; }
      if (data[0].admin_password !== form.password) { setError('Incorrect password.'); return; }
      loginAdmin(data[0]);
      navigate('/admin');
    }
  };

  // Step 1 — Pick role
  if (!role) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🐝</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Who are you logging in as?</p>
          <div className="role-picker">
            <button className="role-btn" onClick={() => setRole('customer')}>
              <User size={28} />
              <span className="role-label">Customer</span>
              <span className="role-desc">Shop groceries & food</span>
            </button>
            <button className="role-btn role-btn-admin" onClick={() => setRole('admin')}>
              <Shield size={28} />
              <span className="role-label">Admin</span>
              <span className="role-desc">Manage the platform</span>
            </button>
          </div>
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2 — Login form
  return (
    <div className="auth-page">
      <div className={`auth-card ${role === 'admin' ? 'admin-login-card' : ''}`}>
        <div className={role === 'admin' ? 'admin-login-icon' : 'auth-logo'}>
          {role === 'admin' ? <Shield size={28} /> : '🐝'}
        </div>
        <h1 className="auth-title" style={role === 'admin' ? { color: '#fff' } : {}}>
          {role === 'admin' ? 'Admin Login' : 'Customer Login'}
        </h1>
        <p className="auth-subtitle" style={role === 'admin' ? { color: 'rgba(255,255,255,0.4)' } : {}}>
          {role === 'admin' ? 'Enter your admin credentials' : 'Log in to your HonestBee account'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={role === 'admin' ? { color: 'rgba(255,255,255,0.5)' } : {}}>
              Email
            </label>
            <input
              type="email"
              className={`form-control ${role === 'admin' ? 'admin-input' : ''}`}
              placeholder={role === 'admin' ? 'admin@honestbee.com' : 'you@email.com'}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={role === 'admin' ? { color: 'rgba(255,255,255,0.5)' } : {}}>
              Password
            </label>
            <input
              type="password"
              className={`form-control ${role === 'admin' ? 'admin-input' : ''}`}
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Log In'}
          </button>
        </form>

        <button
          className="admin-toggle-btn"
          style={role === 'admin' ? { color: 'rgba(255,255,255,0.3)' } : {}}
          onClick={() => { setRole(null); setError(''); setForm({ email: '', password: '' }); }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    customer_password: '', customer_address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: existing } = await supabase
      .from('customer')
      .select('customer_id')
      .eq('customer_email', form.customer_email)
      .maybeSingle();

    if (existing) { setError('Email already registered.'); setLoading(false); return; }

    const { data, error: err } = await supabase
      .from('customer')
      .insert({ ...form, registration_date: new Date().toISOString().split('T')[0] })
      .select()
      .single();

    setLoading(false);
    if (err) { setError(err.message); return; }
    login(data);
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">🐝</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join HonestBee and start ordering</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" placeholder="Juan dela Cruz" value={form.customer_name} onChange={update('customer_name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-control" placeholder="09XXXXXXXXX" value={form.customer_phone} onChange={update('customer_phone')} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="you@email.com" value={form.customer_email} onChange={update('customer_email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="Choose a strong password" value={form.customer_password} onChange={update('customer_password')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <textarea className="form-control" rows={2} placeholder="Your home address" value={form.customer_address} onChange={update('customer_address')} required />
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account 🐝'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}