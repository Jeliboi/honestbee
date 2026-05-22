import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Package, LogOut } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useAdminAuth } from '../hooks/useAdminAuth';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { customer, logout } = useAuth();
  const { admin } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide navbar entirely on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-bee">🐝</span>
          <span className="logo-text">honest<strong>bee</strong></span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link to="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`}>Shop</Link>
          <Link to="/vendors" className={`nav-link ${isActive('/vendors') ? 'active' : ''}`}>Vendors</Link>
          <Link to="/track" className={`nav-link ${isActive('/track') ? 'active' : ''}`}>Track Order</Link>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {customer ? (
            <>
              <Link to="/orders" className="nav-icon-btn" title="My Orders">
                <Package size={20} />
              </Link>
              <Link to="/profile" className="nav-icon-btn" title="Profile">
                <User size={20} />
                <span className="nav-user-name">{customer.customer_name?.split(' ')[0]}</span>
              </Link>
              <button className="nav-icon-btn" onClick={handleLogout} title="Logout">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}

          <Link to="/cart" className="nav-cart-btn">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/vendors" onClick={() => setMenuOpen(false)}>Vendors</Link>
          <Link to="/track" onClick={() => setMenuOpen(false)}>Track Order</Link>
          {customer ? (
            <>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <button onClick={handleLogout} className="mobile-logout">Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}