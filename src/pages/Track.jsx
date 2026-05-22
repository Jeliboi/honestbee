import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Package, Clock, Truck, CheckCircle } from 'lucide-react';
import './Track.css';

const STEPS = [
  { key: 'confirmed',  label: 'Order Confirmed', icon: <Package size={20} />, desc: 'Your order has been received and confirmed.' },
  { key: 'picked_up', label: 'Picked Up',        icon: <Clock size={20} />,   desc: 'Your shopper bee is collecting your items.' },
  { key: 'in_transit',label: 'On the Way',       icon: <Truck size={20} />,   desc: 'Your order is heading to your address.' },
  { key: 'delivered', label: 'Delivered',         icon: <CheckCircle size={20} />, desc: 'Your order has been delivered. Enjoy!' },
];

const STEP_ORDER = ['confirmed', 'picked_up', 'in_transit', 'delivered'];

export default function Track() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const search = async () => {
    if (!orderId.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    const { data: order } = await supabase
      .from('orders')
      .select('*, customer(customer_name), vendor(vendor_name), payment(payment_method, payment_status), delivery(delivery_status, delivery_date, delivery_time, shopper(shopper_name))')
      .eq('order_id', orderId.trim())
      .single();

    setLoading(false);
    if (!order) { setNotFound(true); return; }
    setResult(order);
  };

  const getStepIndex = (status) => STEP_ORDER.indexOf(status);

  const delivery = result?.delivery?.[0];
  const currentStep = delivery?.delivery_status || result?.order_status || 'confirmed';
  const currentStepIdx = getStepIndex(currentStep);

  return (
    <div className="page-content">
      <div className="container">
        <div className="track-header">
          <h1 className="section-title">Track Your Order</h1>
          <p className="section-subtitle">Enter your order ID to see real-time status</p>

          <div className="track-search">
            <input
              className="form-control track-input"
              type="number"
              placeholder="Enter Order ID (e.g. 1)"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <button className="btn btn-primary" onClick={search} disabled={loading}>
              {loading ? '...' : <><Search size={16} /> Track</>}
            </button>
          </div>
        </div>

        {notFound && (
          <div className="alert alert-error">
            No order found with ID #{orderId}. Please check and try again.
          </div>
        )}

        {result && (
          <div className="track-result">
            {/* Order Info */}
            <div className="track-info-card card">
              <div className="card-body">
                <div className="flex justify-between items-center mb-16">
                  <div>
                    <div className="text-muted text-sm">Order ID</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>#{result.order_id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted text-sm">Total Amount</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>₱{parseFloat(result.total_amount).toFixed(2)}</div>
                  </div>
                </div>
                <div className="track-meta-grid">
                  <div><span className="text-muted text-sm">Customer</span><div className="fw-bold">{result.customer?.customer_name}</div></div>
                  <div><span className="text-muted text-sm">Vendor</span><div className="fw-bold">{result.vendor?.vendor_name}</div></div>
                  <div><span className="text-muted text-sm">Shopper Bee</span><div className="fw-bold">{delivery?.shopper?.shopper_name || '—'}</div></div>
                  <div><span className="text-muted text-sm">Payment</span><div className="fw-bold">{result.payment?.[0]?.payment_method || '—'}</div></div>
                  <div><span className="text-muted text-sm">Delivery Date</span><div className="fw-bold">{delivery?.delivery_date || '—'}</div></div>
                  <div><span className="text-muted text-sm">Delivery Time</span><div className="fw-bold">{delivery?.delivery_time || '—'}</div></div>
                </div>
                <div className="mt-16">
                  <div className="text-muted text-sm">Delivery Address</div>
                  <div className="fw-bold">{result.delivery_address}</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="track-timeline">
              <h3 style={{ marginBottom: 24, fontFamily: 'var(--font-display)', fontWeight: 800 }}>Delivery Status</h3>
              <div className="timeline">
                {STEPS.map((step, idx) => {
                  const done = idx <= currentStepIdx;
                  const active = idx === currentStepIdx;
                  return (
                    <div key={step.key} className={`timeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                      <div className="timeline-icon">{step.icon}</div>
                      <div className="timeline-connector" />
                      <div className="timeline-content">
                        <div className="timeline-label">{step.label}</div>
                        {active && <div className="timeline-desc">{step.desc}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
