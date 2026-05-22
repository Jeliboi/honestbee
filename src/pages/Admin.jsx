import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from '../hooks/useAdminAuth';
import {
  Users, Store, Package, ShoppingBag, CreditCard, Truck, UserCheck, LayoutDashboard,
  Plus, Pencil, Trash2, X, Check, LogOut
} from 'lucide-react';
import './Admin.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'customer',  label: 'Customers', icon: <Users size={16} /> },
  { id: 'vendor',    label: 'Vendors',   icon: <Store size={16} /> },
  { id: 'product',   label: 'Products',  icon: <Package size={16} /> },
  { id: 'orders',    label: 'Orders',    icon: <ShoppingBag size={16} /> },
  { id: 'payment',   label: 'Payments',  icon: <CreditCard size={16} /> },
  { id: 'shopper',   label: 'Shoppers',  icon: <UserCheck size={16} /> },
  { id: 'delivery',  label: 'Deliveries',icon: <Truck size={16} /> },
];

export default function Admin() {
  const { admin, logoutAdmin, loaded } = useAdminAuth();
  const navigate = useNavigate();

  // All hooks must be declared before any early return
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdminLogout = () => { logoutAdmin(); navigate('/login'); };

  useEffect(() => {
    if (loaded && !admin) {
      navigate('/admin-login');
    }
  }, [admin, loaded, navigate]);

  // Wait for localStorage to load before deciding
  if (!loaded) return null;
  if (!admin) return null;

  // Load dashboard stats
  useEffect(() => {
    async function loadStats() {
      const tables = ['customer', 'vendor', 'product', 'orders', 'payment', 'shopper', 'delivery'];
      const counts = await Promise.all(
        tables.map(t => supabase.from(t).select('*', { count: 'exact', head: true }))
      );
      const s = {};
      tables.forEach((t, i) => { s[t] = counts[i].count || 0; });
      // Revenue
      const { data: payments } = await supabase.from('payment').select('amount_paid').eq('payment_status', 'completed');
      s.revenue = (payments || []).reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
      setStats(s);
    }
    loadStats();
  }, [activeTab]);

  const loadTable = useCallback(async (tab) => {
    if (tab === 'dashboard') return;
    setLoading(true);
    setError('');
    let q;
    if (tab === 'product') q = supabase.from('product').select('*, vendor(vendor_name)').order('product_id');
    else if (tab === 'orders') q = supabase.from('orders').select('*, customer(customer_name), vendor(vendor_name)').order('order_id', { ascending: false });
    else if (tab === 'delivery') q = supabase.from('delivery').select('*, shopper(shopper_name), orders(order_id)').order('delivery_id', { ascending: false });
    else q = supabase.from(tab).select('*').order(tab + '_id');
    const { data: rows, error: e } = await q;
    if (e) setError(e.message);
    setData(rows || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadTable(activeTab); }, [activeTab, loadTable]);

  const openAdd = () => { setFormData({}); setModal({ mode: 'add' }); setError(''); };
  const openEdit = (row) => { setFormData({ ...row }); setModal({ mode: 'edit', row }); setError(''); };
  const closeModal = () => { setModal(null); setFormData({}); setError(''); };

  const getPK = () => {
    const pk = { customer: 'customer_id', vendor: 'vendor_id', product: 'product_id', orders: 'order_id', payment: 'payment_id', shopper: 'shopper_id', delivery: 'delivery_id' };
    return pk[activeTab];
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const pk = getPK();
    const cleanData = { ...formData };
    delete cleanData[pk];
    delete cleanData.vendor;
    delete cleanData.customer;
    delete cleanData.shopper;
    delete cleanData.orders;

    let err;
    if (modal.mode === 'add') {
      ({ error: err } = await supabase.from(activeTab).insert(cleanData));
    } else {
      ({ error: err } = await supabase.from(activeTab).update(cleanData).eq(pk, modal.row[pk]));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSuccess(modal.mode === 'add' ? 'Record added!' : 'Record updated!');
    setTimeout(() => setSuccess(''), 2000);
    closeModal();
    loadTable(activeTab);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    const pk = getPK();
    const { error: err } = await supabase.from(activeTab).delete().eq(pk, id);
    if (err) { setError(err.message); return; }
    setSuccess('Record deleted.');
    setTimeout(() => setSuccess(''), 2000);
    loadTable(activeTab);
  };

  const updateForm = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.value }));

  const renderTableContent = () => {
    if (loading) return <div className="loading-screen"><div className="spinner" /> Loading...</div>;
    if (data.length === 0) return <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No records found</h3></div>;

    const cols = getColumns(activeTab);
    const pk = getPK();

    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>{cols.map(c => <th key={c.key}>{c.label}</th>)}<th>Actions</th></tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row[pk]}>
                {cols.map(c => (
                  <td key={c.key}>
                    {c.render ? c.render(row) : (row[c.key] ?? '—')}
                  </td>
                ))}
                <td>
                  <div className="flex gap-8">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)} title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row[pk])} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderForm = () => {
    const fields = getFormFields(activeTab);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {fields.map(f => (
          <div key={f.key} className="form-group">
            <label className="form-label">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea className="form-control" rows={2} value={formData[f.key] || ''} onChange={updateForm(f.key)} />
            ) : f.type === 'select' ? (
              <select className="form-control" value={formData[f.key] || ''} onChange={updateForm(f.key)}>
                <option value="">Select...</option>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type={f.type || 'text'} className="form-control" placeholder={f.placeholder} value={formData[f.key] || ''} onChange={updateForm(f.key)} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-page page-content">
      {/* Sidebar */}
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <span className="logo-bee">🐝</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>Admin Panel</span>
          </div>
          <nav className="admin-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <div className="admin-logged-in">
              <div className="admin-avatar">{admin.admin_name?.[0]}</div>
              <div className="admin-info">
                <div className="admin-info-name">{admin.admin_name}</div>
                <div className="admin-info-role">Administrator</div>
              </div>
            </div>
            <button className="admin-logout-btn" onClick={handleAdminLogout} title="Logout">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="admin-main">
          {/* Notifications */}
          {error && <div className="alert alert-error mb-16">{error}</div>}
          {success && <div className="alert alert-success mb-16"><Check size={14} /> {success}</div>}

          {activeTab === 'dashboard' ? (
            <div className="admin-dashboard">
              <h1 className="section-title">Dashboard Overview</h1>
              <p className="section-subtitle mb-24">HonestBee platform at a glance</p>
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#DBF0FF' }}><Users size={22} color="var(--bee-blue)" /></div>
                  <div><div className="stat-value">{stats.customer || 0}</div><div className="stat-label">Customers</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#FFF3CC' }}><Store size={22} color="#9A7200" /></div>
                  <div><div className="stat-value">{stats.vendor || 0}</div><div className="stat-label">Vendors</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#D4F5E4' }}><Package size={22} color="var(--bee-green)" /></div>
                  <div><div className="stat-value">{stats.product || 0}</div><div className="stat-label">Products</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#FCE0DD' }}><ShoppingBag size={22} color="var(--bee-red)" /></div>
                  <div><div className="stat-value">{stats.orders || 0}</div><div className="stat-label">Orders</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#F0F0FF' }}><UserCheck size={22} color="#6060CC" /></div>
                  <div><div className="stat-value">{stats.shopper || 0}</div><div className="stat-label">Shoppers</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#FFFBEC' }}><CreditCard size={22} color="#9A7200" /></div>
                  <div><div className="stat-value">₱{(stats.revenue || 0).toLocaleString()}</div><div className="stat-label">Total Revenue</div></div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="section-header">
                <div>
                  <h1 className="section-title">{TABS.find(t => t.id === activeTab)?.label}</h1>
                  <p className="section-subtitle">{data.length} records</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={openAdd}>
                  <Plus size={14} /> Add New
                </button>
              </div>
              {renderTableContent()}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{modal.mode === 'add' ? 'Add' : 'Edit'} {TABS.find(t => t.id === activeTab)?.label.slice(0, -1)}</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              {renderForm()}
              <div className="flex gap-8 justify-between mt-8">
                <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : <><Check size={14} /> {modal.mode === 'add' ? 'Add Record' : 'Save Changes'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Column definitions per table ───────────────────────
function getColumns(tab) {
  const maps = {
    customer: [
      { key: 'customer_id', label: 'ID' },
      { key: 'customer_name', label: 'Name' },
      { key: 'customer_email', label: 'Email' },
      { key: 'customer_phone', label: 'Phone' },
      { key: 'registration_date', label: 'Registered' },
      { key: 'customer_address', label: 'Address' },
    ],
    vendor: [
      { key: 'vendor_id', label: 'ID' },
      { key: 'vendor_name', label: 'Name' },
      { key: 'vendor_type', label: 'Type', render: r => <span className="badge badge-yellow">{r.vendor_type}</span> },
      { key: 'vendor_email', label: 'Email' },
      { key: 'vendor_phone', label: 'Phone' },
      { key: 'commission_rate', label: 'Commission', render: r => `${r.commission_rate}%` },
    ],
    product: [
      { key: 'product_id', label: 'ID' },
      { key: 'product_name', label: 'Product' },
      { key: 'vendor', label: 'Vendor', render: r => r.vendor?.vendor_name || '—' },
      { key: 'product_price', label: 'Price', render: r => `₱${parseFloat(r.product_price).toFixed(2)}` },
      { key: 'stock_quantity', label: 'Stock', render: r => <span className={`badge ${r.stock_quantity > 0 ? 'badge-green' : 'badge-red'}`}>{r.stock_quantity}</span> },
      { key: 'product_category', label: 'Category', render: r => <span className="badge badge-gray">{r.product_category}</span> },
    ],
    orders: [
      { key: 'order_id', label: 'ID' },
      { key: 'order_date', label: 'Date' },
      { key: 'customer', label: 'Customer', render: r => r.customer?.customer_name || '—' },
      { key: 'vendor', label: 'Vendor', render: r => r.vendor?.vendor_name || '—' },
      { key: 'total_amount', label: 'Total', render: r => `₱${parseFloat(r.total_amount).toFixed(2)}` },
      { key: 'order_status', label: 'Status', render: r => {
        const colors = { pending: 'badge-yellow', confirmed: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' };
        return <span className={`badge ${colors[r.order_status] || 'badge-gray'}`}>{r.order_status}</span>;
      }},
    ],
    payment: [
      { key: 'payment_id', label: 'ID' },
      { key: 'order_id', label: 'Order ID' },
      { key: 'payment_date', label: 'Date' },
      { key: 'payment_method', label: 'Method' },
      { key: 'payment_status', label: 'Status', render: r => <span className={`badge ${r.payment_status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>{r.payment_status}</span> },
      { key: 'amount_paid', label: 'Amount', render: r => `₱${parseFloat(r.amount_paid).toFixed(2)}` },
    ],
    shopper: [
      { key: 'shopper_id', label: 'ID' },
      { key: 'shopper_name', label: 'Name' },
      { key: 'shopper_phone', label: 'Phone' },
      { key: 'employment_status', label: 'Status', render: r => <span className={`badge ${r.employment_status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{r.employment_status}</span> },
      { key: 'hire_date', label: 'Hired' },
    ],
    delivery: [
      { key: 'delivery_id', label: 'ID' },
      { key: 'order_id', label: 'Order ID' },
      { key: 'shopper', label: 'Shopper', render: r => r.shopper?.shopper_name || '—' },
      { key: 'delivery_status', label: 'Status', render: r => {
        const colors = { pending: 'badge-yellow', picked_up: 'badge-blue', delivered: 'badge-green' };
        return <span className={`badge ${colors[r.delivery_status] || 'badge-gray'}`}>{r.delivery_status}</span>;
      }},
      { key: 'delivery_date', label: 'Date' },
      { key: 'delivery_time', label: 'Time' },
    ],
  };
  return maps[tab] || [];
}

// ─── Form field definitions per table ───────────────────
function getFormFields(tab) {
  const maps = {
    customer: [
      { key: 'customer_name', label: 'Full Name', placeholder: 'Juan dela Cruz' },
      { key: 'customer_email', label: 'Email', type: 'email', placeholder: 'juan@email.com' },
      { key: 'customer_phone', label: 'Phone', placeholder: '09XXXXXXXXX' },
      { key: 'customer_password', label: 'Password', type: 'password' },
      { key: 'customer_address', label: 'Address', type: 'textarea' },
      { key: 'registration_date', label: 'Registration Date', type: 'date' },
    ],
    vendor: [
      { key: 'vendor_name', label: 'Vendor Name', placeholder: 'FreshMart' },
      { key: 'vendor_type', label: 'Type', type: 'select', options: ['Supermarket', 'Restaurant', 'Specialty', 'Pharmacy'] },
      { key: 'vendor_email', label: 'Email', type: 'email' },
      { key: 'vendor_phone', label: 'Phone', placeholder: '09XXXXXXXXX' },
      { key: 'vendor_address', label: 'Address', type: 'textarea' },
      { key: 'commission_rate', label: 'Commission Rate (%)', type: 'number', placeholder: '10.00' },
    ],
    product: [
      { key: 'product_name', label: 'Product Name' },
      { key: 'product_description', label: 'Description', type: 'textarea' },
      { key: 'product_price', label: 'Price (₱)', type: 'number', placeholder: '0.00' },
      { key: 'stock_quantity', label: 'Stock Quantity', type: 'number', placeholder: '0' },
      { key: 'product_category', label: 'Category', type: 'select', options: ['Dairy', 'Bakery', 'Meals', 'Vegetables', 'Fruits', 'Beverages', 'Grains', 'Japanese', 'Meat', 'Seafood', 'Snacks'] },
      { key: 'vendor_id', label: 'Vendor ID', type: 'number' },
    ],
    orders: [
      { key: 'order_date', label: 'Order Date', type: 'date' },
      { key: 'order_status', label: 'Status', type: 'select', options: ['pending', 'confirmed', 'picked_up', 'delivered', 'cancelled'] },
      { key: 'total_amount', label: 'Total Amount (₱)', type: 'number' },
      { key: 'customer_id', label: 'Customer ID', type: 'number' },
      { key: 'vendor_id', label: 'Vendor ID', type: 'number' },
      { key: 'delivery_address', label: 'Delivery Address', type: 'textarea' },
    ],
    payment: [
      { key: 'order_id', label: 'Order ID', type: 'number' },
      { key: 'payment_date', label: 'Payment Date', type: 'date' },
      { key: 'payment_method', label: 'Method', type: 'select', options: ['Credit Card', 'Debit Card', 'GCash', 'Maya', 'Cash on Delivery'] },
      { key: 'payment_status', label: 'Status', type: 'select', options: ['pending', 'completed', 'failed', 'refunded'] },
      { key: 'amount_paid', label: 'Amount Paid (₱)', type: 'number' },
    ],
    shopper: [
      { key: 'shopper_name', label: 'Full Name' },
      { key: 'shopper_phone', label: 'Phone', placeholder: '09XXXXXXXXX' },
      { key: 'employment_status', label: 'Status', type: 'select', options: ['active', 'on-leave', 'inactive'] },
      { key: 'hire_date', label: 'Hire Date', type: 'date' },
    ],
    delivery: [
      { key: 'order_id', label: 'Order ID', type: 'number' },
      { key: 'shopper_id', label: 'Shopper ID', type: 'number' },
      { key: 'delivery_status', label: 'Status', type: 'select', options: ['pending', 'picked_up', 'in_transit', 'delivered', 'failed'] },
      { key: 'delivery_date', label: 'Delivery Date', type: 'date' },
      { key: 'delivery_time', label: 'Delivery Time', type: 'time' },
    ],
  };
  return maps[tab] || [];
}