import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { Search, ShoppingCart, Plus, Minus, SlidersHorizontal } from 'lucide-react';
import './Shop.css';

const CATEGORIES = ['All', 'Dairy', 'Bakery', 'Meals', 'Vegetables', 'Fruits', 'Beverages', 'Grains', 'Japanese', 'Meat'];

const EMOJI_MAP = {
  Dairy: '🥛', Bakery: '🍞', Meals: '🍱', Vegetables: '🥦',
  Fruits: '🍎', Beverages: '🥤', Grains: '🌾', Japanese: '🍣', Meat: '🥩', Seafood: '🦐',
};

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [addedMap, setAddedMap] = useState({});
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();

  const urlCategory = searchParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(urlCategory);

  useEffect(() => { setActiveCategory(urlCategory); }, [urlCategory]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase.from('product').select('*, vendor(vendor_id, vendor_name, vendor_type)');
      if (activeCategory !== 'All') q = q.eq('product_category', activeCategory);
      if (selectedVendor !== 'all') q = q.eq('vendor_id', selectedVendor);
      const { data } = await q.order('product_name');
      setProducts(data || []);
      setLoading(false);
    }
    load();
  }, [activeCategory, selectedVendor]);

  useEffect(() => {
    supabase.from('vendor').select('vendor_id, vendor_name').then(({ data }) => setVendors(data || []));
  }, []);

  const filtered = products.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.product_description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (product) => {
    const qty = quantities[product.product_id] || 1;
    addItem(product, qty);
    setAddedMap(prev => ({ ...prev, [product.product_id]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.product_id]: false })), 1500);
  };

  const setQty = (id, val) => setQuantities(prev => ({ ...prev, [id]: Math.max(1, val) }));

  return (
    <div className="page-content">
      <div className="container">
        {/* Header */}
        <div className="shop-header">
          <div>
            <h1 className="section-title">Shop</h1>
            <p className="section-subtitle">{filtered.length} products available</p>
          </div>
          <div className="shop-search-wrap">
            <Search size={16} className="search-icon" />
            <input
              className="shop-search"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="shop-filters">
          <div className="pill-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`pill-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat !== 'All' && <span>{EMOJI_MAP[cat] || '🛒'}</span>} {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-8" style={{ flexShrink: 0 }}>
            <SlidersHorizontal size={16} style={{ color: 'var(--bee-muted)' }} />
            <select
              className="form-control"
              style={{ width: 180 }}
              value={selectedVendor}
              onChange={e => setSelectedVendor(e.target.value)}
            >
              <option value="all">All Vendors</option>
              {vendors.map(v => (
                <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="loading-screen"><div className="spinner" /> Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try a different category or search term.</p>
          </div>
        ) : (
          <div className="shop-products-grid">
            {filtered.map(p => (
              <div key={p.product_id} className="shop-product-card card">
                <div className="shop-product-img">
                  <span>{EMOJI_MAP[p.product_category] || '🛒'}</span>
                  {p.stock_quantity === 0 && <div className="out-badge">Out of Stock</div>}
                </div>
                <div className="card-body shop-product-body">
                  <div className="product-vendor">{p.vendor?.vendor_name}</div>
                  <div className="product-name">{p.product_name}</div>
                  {p.product_description && <div className="product-desc">{p.product_description}</div>}
                  <div className="product-meta">
                    <span className="badge badge-gray">{p.product_category}</span>
                    <span className="text-sm text-muted">{p.stock_quantity} in stock</span>
                  </div>
                  <div className="product-price-row">
                    <span className="product-price">₱{parseFloat(p.product_price).toFixed(2)}</span>
                  </div>
                  {p.stock_quantity > 0 ? (
                    <div className="product-add-row">
                      <div className="qty-ctrl">
                        <button className="qty-btn" onClick={() => setQty(p.product_id, (quantities[p.product_id] || 1) - 1)}>
                          <Minus size={12} />
                        </button>
                        <span className="qty-val">{quantities[p.product_id] || 1}</span>
                        <button className="qty-btn" onClick={() => setQty(p.product_id, (quantities[p.product_id] || 1) + 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        className={`btn btn-primary btn-sm ${addedMap[p.product_id] ? 'btn-added' : ''}`}
                        onClick={() => handleAdd(p)}
                      >
                        {addedMap[p.product_id] ? '✓ Added!' : <><ShoppingCart size={14} /> Add</>}
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-sm w-full" disabled>Unavailable</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
