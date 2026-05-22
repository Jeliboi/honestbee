import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, Star, Zap, Shield, Clock } from 'lucide-react';
import './Home.css';

const CATEGORIES = [
  { emoji: '🥩', label: 'Meat & Seafood', query: 'Meat' },
  { emoji: '🥦', label: 'Vegetables', query: 'Vegetables' },
  { emoji: '🍞', label: 'Bakery', query: 'Bakery' },
  { emoji: '🥛', label: 'Dairy', query: 'Dairy' },
  { emoji: '🍱', label: 'Ready Meals', query: 'Meals' },
  { emoji: '🍎', label: 'Fruits', query: 'Fruits' },
  { emoji: '🥤', label: 'Beverages', query: 'Beverages' },
  { emoji: '🌾', label: 'Grains & Rice', query: 'Grains' },
];

const FEATURES = [
  { icon: <Zap size={24} />, title: 'Lightning Fast', desc: 'Same-day delivery in as little as 1 hour.' },
  { icon: <Star size={24} />, title: 'Top-Rated Stores', desc: 'Curated partner vendors for quality assurance.' },
  { icon: <Shield size={24} />, title: 'Secure Payments', desc: 'Multiple payment methods, 100% protected.' },
  { icon: <Clock size={24} />, title: 'Live Tracking', desc: 'Track your order from store to your door.' },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: products }, { data: v }] = await Promise.all([
        supabase.from('product').select('*, vendor(vendor_name)').limit(8),
        supabase.from('vendor').select('*').limit(6),
      ]);
      setFeaturedProducts(products || []);
      setVendors(v || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">🐝 Philippines' Favourite Delivery App</div>
            <h1 className="hero-title">
              Groceries &amp;<br />
              <span className="hero-highlight">Food Delivered</span><br />
              to Your Door
            </h1>
            <p className="hero-desc">
              Shop from supermarkets, specialty stores, and restaurants. 
              Our shopper bees handle everything from cart to doorstep.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary btn-lg">
                Start Shopping <ArrowRight size={18} />
              </Link>
              <Link to="/vendors" className="btn btn-secondary btn-lg">
                Browse Vendors
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>50+</strong><span>Partner Stores</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>10K+</strong><span>Happy Customers</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>1hr</strong><span>Avg Delivery</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="hero-float-card hc1">🛒 Order placed!</div>
              <div className="hero-float-card hc2">🐝 Shopper assigned</div>
              <div className="hero-float-card hc3">🚀 On the way!</div>
              <div className="hero-big-emoji">🛍️</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Find exactly what you're craving</p>
            </div>
            <Link to="/shop" className="btn btn-ghost btn-sm">See all <ArrowRight size={14} /></Link>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.label} to={`/shop?category=${cat.query}`} className="category-chip">
                <span className="cat-emoji">{cat.emoji}</span>
                <span className="cat-label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Fresh picks from our vendors</p>
            </div>
            <Link to="/shop" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>
          </div>

          {loading ? (
            <div className="loading-screen"><div className="spinner" /> Loading products...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(p => (
                <Link key={p.product_id} to={`/shop`} className="product-card card">
                  <div className="product-card-img">
                    <span className="product-emoji">{getCategoryEmoji(p.product_category)}</span>
                  </div>
                  <div className="product-card-body card-body">
                    <div className="product-vendor">{p.vendor?.vendor_name}</div>
                    <div className="product-name">{p.product_name}</div>
                    {p.product_description && (
                      <div className="product-desc">{p.product_description}</div>
                    )}
                    <div className="product-footer">
                      <span className="product-price">₱{parseFloat(p.product_price).toFixed(2)}</span>
                      <span className={`badge ${p.stock_quantity > 0 ? 'badge-green' : 'badge-red'}`}>
                        {p.stock_quantity > 0 ? 'In Stock' : 'Out'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Vendors */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Our Partner Vendors</h2>
              <p className="section-subtitle">Quality stores, hand-picked for you</p>
            </div>
            <Link to="/vendors" className="btn btn-ghost btn-sm">All vendors <ArrowRight size={14} /></Link>
          </div>
          <div className="vendors-grid">
            {vendors.map(v => (
              <Link key={v.vendor_id} to={`/vendors`} className="vendor-card card">
                <div className="vendor-card-header">
                  <div className="vendor-logo">{v.vendor_name[0]}</div>
                  <span className="badge badge-yellow">{v.vendor_type}</span>
                </div>
                <div className="card-body">
                  <div className="fw-bold" style={{ fontSize: 16 }}>{v.vendor_name}</div>
                  <div className="text-muted text-sm mt-8">{v.vendor_address}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-black">
        <div className="container">
          <div className="features-header">
            <h2 className="section-title" style={{ color: '#fff' }}>Why HonestBee?</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.5)' }}>Everything you need, delivered with care</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container cta-inner">
          <div className="cta-text">
            <h2>Ready to Buzz In?</h2>
            <p>Join thousands of happy customers getting fresh groceries and hot meals delivered daily.</p>
          </div>
          <div className="flex gap-12">
            <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
            <Link to="/shop" className="btn btn-secondary btn-lg">Browse First</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="logo-bee" style={{ fontSize: 28 }}>🐝</span>
            <span className="logo-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              honest<strong>bee</strong>
            </span>
          </div>
          <p className="footer-copy">© 2026 HonestBee Clone · Built with React + Supabase · IMDBSYS32</p>
          <Link to="/admin-login" style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', textDecoration: 'none' }}>
            Staff Login
          </Link>
        </div>
      </footer>
    </div>
  );
}

function getCategoryEmoji(cat) {
  const map = {
    'Dairy': '🥛', 'Bakery': '🍞', 'Meals': '🍱', 'Vegetables': '🥦',
    'Fruits': '🍎', 'Beverages': '🥤', 'Grains': '🌾', 'Japanese': '🍣',
    'Meat': '🥩', 'Seafood': '🦐',
  };
  return map[cat] || '🛒';
}