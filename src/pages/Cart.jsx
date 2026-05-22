import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import './Cart.css';

const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'GCash', 'Maya', 'Cash on Delivery'];

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, cartTotal } = useCart();
  const { customer } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('cart'); // cart | checkout | success
  const [shoppers, setShoppers] = useState([]);
  const [form, setForm] = useState({
    delivery_address: customer?.customer_address || '',
    payment_method: 'GCash',
    delivery_date: '',
    delivery_time: '10:00',
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    supabase.from('shopper')
      .select('shopper_id, shopper_name')
      .eq('employment_status', 'active')
      .then(({ data }) => setShoppers(data || []));
  }, []);

  useEffect(() => {
    if (customer) setForm(f => ({ ...f, delivery_address: customer.customer_address || '' }));
  }, [customer]);

  // Group items by vendor
  const byVendor = items.reduce((acc, item) => {
    const vid = item.vendor_id;
    if (!acc[vid]) acc[vid] = { name: item.vendor?.vendor_name || item.vendor_name || 'Vendor', items: [] };
    acc[vid].items.push(item);
    return acc;
  }, {});

  const vendorIds = [...new Set(items.map(i => i.vendor_id))];
  const primaryVendorId = vendorIds[0];

  const handlePlaceOrder = async () => {
    if (!customer) { navigate('/login'); return; }
    if (items.length === 0) { setError('Your cart is empty.'); return; }
    if (!form.delivery_date) { setError('Please pick a delivery date.'); return; }

    setPlacing(true);
    setError('');

    try {
      // Create order
      const { data: order, error: oErr } = await supabase
        .from('orders')
        .insert({
          order_date: new Date().toISOString().split('T')[0],
          order_status: 'confirmed',
          total_amount: cartTotal,
          customer_id: customer.customer_id,
          vendor_id: primaryVendorId,
          delivery_address: form.delivery_address,
        })
        .select()
        .single();

      if (oErr) throw oErr;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product_price,
        subtotal: item.product_price * item.quantity,
      }));

      const { error: oiErr } = await supabase.from('order_item').insert(orderItems);
      if (oiErr) throw oiErr;

      // Create payment
      const { error: pErr } = await supabase.from('payment').insert({
        order_id: order.order_id,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: form.payment_method,
        payment_status: 'completed',
        amount_paid: cartTotal,
      });
      if (pErr) throw pErr;

      // Assign shopper
      const randomShopper = shoppers[Math.floor(Math.random() * shoppers.length)];
      if (randomShopper) {
        await supabase.from('delivery').insert({
          order_id: order.order_id,
          shopper_id: randomShopper.shopper_id,
          delivery_status: 'pending',
          delivery_date: form.delivery_date,
          delivery_time: form.delivery_time,
        });
      }

      setOrderId(order.order_id);
      clearCart();
      setStep('success');
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="page-content">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">🎉</div>
            <h1>Order Placed!</h1>
            <p>Your order <strong>#{orderId}</strong> has been confirmed. A shopper bee is on the way!</p>
            <div className="success-actions">
              <Link to="/orders" className="btn btn-primary btn-lg">Track My Order</Link>
              <Link to="/shop" className="btn btn-secondary btn-lg">Keep Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        {/* Step Indicator */}
        <div className="cart-steps">
          <div className={`cart-step ${step === 'cart' ? 'active' : step === 'checkout' ? 'done' : ''}`}>
            <span className="step-num">1</span> Cart
          </div>
          <div className="step-line" />
          <div className={`cart-step ${step === 'checkout' ? 'active' : ''}`}>
            <span className="step-num">2</span> Checkout
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some items from the shop to get started.</p>
            <Link to="/shop" className="btn btn-primary mt-16">Browse Products</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Left: Items or Checkout form */}
            <div className="cart-main">
              {step === 'cart' ? (
                <>
                  <h2 className="cart-section-title">Your Cart ({items.length} items)</h2>
                  {items.map(item => (
                    <div key={item.product_id} className="cart-item">
                      <div className="cart-item-emoji">
                        {getCatEmoji(item.product_category)}
                      </div>
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.product_name}</div>
                        <div className="cart-item-vendor text-muted text-sm">{item.vendor?.vendor_name}</div>
                        <div className="cart-item-price">₱{parseFloat(item.product_price).toFixed(2)} each</div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="qty-ctrl">
                          <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity - 1)}>
                            <Minus size={12} />
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity + 1)}>
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="cart-item-subtotal">
                          ₱{(item.product_price * item.quantity).toFixed(2)}
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.product_id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <h2 className="cart-section-title">Delivery & Payment</h2>
                  {error && <div className="alert alert-error">{error}</div>}

                  <div className="checkout-form">
                    {!customer && (
                      <div className="alert alert-info">
                        Please <Link to="/login">log in</Link> to place your order.
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Delivery Address</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={form.delivery_address}
                        onChange={e => setForm(f => ({ ...f, delivery_address: e.target.value }))}
                        placeholder="Enter your full delivery address"
                      />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Delivery Date</label>
                        <input
                          type="date"
                          className="form-control"
                          min={new Date().toISOString().split('T')[0]}
                          value={form.delivery_date}
                          onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Preferred Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={form.delivery_time}
                          onChange={e => setForm(f => ({ ...f, delivery_time: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <div className="payment-methods">
                        {PAYMENT_METHODS.map(m => (
                          <button
                            key={m}
                            className={`payment-option ${form.payment_method === m ? 'selected' : ''}`}
                            onClick={() => setForm(f => ({ ...f, payment_method: m }))}
                          >
                            {getPaymentEmoji(m)} {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Summary */}
            <div className="cart-summary">
              <h3 className="cart-section-title">Order Summary</h3>
              <div className="summary-rows">
                {items.map(item => (
                  <div key={item.product_id} className="summary-row">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>₱{(item.product_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-divider" />
              <div className="summary-row">
                <span className="text-muted">Delivery Fee</span>
                <span className="badge badge-green">Free</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span className="total-amount">₱{cartTotal.toFixed(2)}</span>
              </div>

              {step === 'cart' ? (
                <button
                  className="btn btn-primary w-full btn-lg"
                  onClick={() => setStep('checkout')}
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  className="btn btn-primary w-full btn-lg"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                >
                  {placing ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Placing...</> : <>
                    <ShoppingBag size={16} /> Place Order
                  </>}
                </button>
              )}

              {step === 'checkout' && (
                <button className="btn btn-ghost w-full mt-8" onClick={() => setStep('cart')}>
                  ← Back to Cart
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getCatEmoji(cat) {
  const map = { Dairy: '🥛', Bakery: '🍞', Meals: '🍱', Vegetables: '🥦', Fruits: '🍎', Beverages: '🥤', Grains: '🌾', Japanese: '🍣' };
  return map[cat] || '🛒';
}

function getPaymentEmoji(m) {
  const map = { 'Credit Card': '💳', 'Debit Card': '💳', 'GCash': '📱', 'Maya': '📲', 'Cash on Delivery': '💵' };
  return map[m] || '💰';
}
