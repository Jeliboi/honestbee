import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Store, MapPin, Phone, Mail, Tag } from 'lucide-react';

const TYPE_COLORS = { Supermarket: 'badge-blue', Restaurant: 'badge-yellow', Specialty: 'badge-green', Pharmacy: 'badge-red' };

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    supabase.from('vendor').select('*').order('vendor_name')
      .then(({ data }) => { setVendors(data || []); setLoading(false); });
  }, []);

  const types = ['All', ...new Set(vendors.map(v => v.vendor_type))];
  const filtered = filter === 'All' ? vendors : vendors.filter(v => v.vendor_type === filter);

  return (
    <div className="page-content">
      <div className="container">
        <div className="section-header">
          <div>
            <h1 className="section-title">Our Partner Vendors</h1>
            <p className="section-subtitle">{filtered.length} stores available</p>
          </div>
          <Link to="/shop" className="btn btn-primary btn-sm">Browse Products →</Link>
        </div>

        <div className="pill-tabs mb-24">
          {types.map(t => (
            <button key={t} className={`pill-tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : (
          <div className="grid-3">
            {filtered.map(v => (
              <div key={v.vendor_id} className="card vendor-detail-card">
                <div style={{ background: 'linear-gradient(135deg, #111, #2A2A2A)', padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, background: 'var(--bee-yellow)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--bee-black)', flexShrink: 0 }}>
                    {v.vendor_name[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#fff' }}>{v.vendor_name}</div>
                    <span className={`badge ${TYPE_COLORS[v.vendor_type] || 'badge-gray'}`} style={{ marginTop: 6 }}>{v.vendor_type}</span>
                  </div>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="flex items-center gap-8 text-sm text-muted"><MapPin size={14} />{v.vendor_address}</div>
                  <div className="flex items-center gap-8 text-sm text-muted"><Phone size={14} />{v.vendor_phone}</div>
                  <div className="flex items-center gap-8 text-sm text-muted"><Mail size={14} />{v.vendor_email}</div>
                  <div className="flex items-center gap-8 text-sm"><Tag size={14} /><span style={{ fontWeight: 600 }}>Commission: {v.commission_rate}%</span></div>
                  <Link to={`/shop?vendor=${v.vendor_id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>
                    <Store size={14} /> View Products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
