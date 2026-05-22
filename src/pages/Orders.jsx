import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import './Orders.css';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',    color: 'badge-yellow', icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmed',  color: 'badge-blue',   icon: <Package size={14} /> },
  picked_up: { label: 'Picked Up',  color: 'badge-blue',   icon: <Truck size={14} /> },
  delivered: { label: 'Delivered',  color: 'badge-green',  icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelled',  color: 'badge-red',    icon: <XCircle size={14} /> },
};

export default function Orders() {
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  useEffect(() => {
    if (!customer) { navigate('/login'); return; }
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('*, vendor(vendor_name), payment(payment_method, payment_status, amount_paid), delivery(delivery_status, delivery_date, delivery_time, shopper(shopper_name))')
        .eq('customer_id', customer.customer_id)
        .order('order_date', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    load();
  }, [customer, navigate]);

  const loadItems = async (orderId) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase
      .from('order_item')
      .select('*, product(product_name, product_category)')
      .eq('order_id', orderId);
    setOrderItems(prev => ({ ...prev, [orderId]: data || [] }));
  };

  const toggleExpand = (orderId) => {
    const next = expanded === orderId ? null : orderId;
    setExpanded(next);
    if (next) loadItems(next);
  };

  if (loading) return <div className="page-content"><div className="loading-screen"><div className="spinner" /> Loading orders...</div></div>;

  return (
    <div className="page-content">
      <div className="container">
        <div className="section-header">
          <div>
            <h1 className="section-title">My Orders</h1>
            <p className="section-subtitle">{orders.length} orders total</p>
          </div>
          <Link to="/shop" className="btn btn-primary btn-sm">Shop More 🛒</Link>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Place your first order to see it here.</p>
            <Link to="/shop" className="btn btn-primary mt-16">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const status = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.pending;
              const delivery = order.delivery?.[0];
              const payment = order.payment?.[0];
              const isExpanded = expanded === order.order_id;

              return (
                <div key={order.order_id} className={`order-card card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="order-card-header" onClick={() => toggleExpand(order.order_id)}>
                    <div className="order-id-block">
                      <div className="order-num">Order #{order.order_id}</div>
                      <div className="order-date text-muted text-sm">{order.order_date}</div>
                    </div>
                    <div className="order-vendor">{order.vendor?.vendor_name}</div>
                    <div className="flex items-center gap-8">
                      <span className={`badge ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                      <span className="order-total">₱{parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                    <button className="expand-btn">{isExpanded ? '▲' : '▼'}</button>
                  </div>

                  {isExpanded && (
                    <div className="order-card-body">
                      {/* Order Items */}
                      <div className="order-detail-section">
                        <h4>Items Ordered</h4>
                        {(orderItems[order.order_id] || []).map(item => (
                          <div key={item.orderitem_id} className="order-item-row">
                            <span>{item.product?.product_name} × {item.quantity}</span>
                            <span>₱{parseFloat(item.subtotal).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-detail-cols">
                        {/* Delivery Info */}
                        {delivery && (
                          <div className="order-detail-section">
                            <h4>🚚 Delivery</h4>
                            <div className="detail-row"><span>Status</span><span className={`badge ${STATUS_CONFIG[delivery.delivery_status]?.color || 'badge-gray'}`}>{delivery.delivery_status}</span></div>
                            <div className="detail-row"><span>Shopper Bee</span><span>{delivery.shopper?.shopper_name}</span></div>
                            <div className="detail-row"><span>Date</span><span>{delivery.delivery_date}</span></div>
                            <div className="detail-row"><span>Time</span><span>{delivery.delivery_time}</span></div>
                            <div className="detail-row"><span>Address</span><span>{order.delivery_address}</span></div>
                          </div>
                        )}

                        {/* Payment Info */}
                        {payment && (
                          <div className="order-detail-section">
                            <h4>💳 Payment</h4>
                            <div className="detail-row"><span>Method</span><span>{payment.payment_method}</span></div>
                            <div className="detail-row"><span>Status</span><span className={`badge ${payment.payment_status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>{payment.payment_status}</span></div>
                            <div className="detail-row"><span>Amount Paid</span><strong>₱{parseFloat(payment.amount_paid).toFixed(2)}</strong></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
