import { useState, useEffect, createContext, useContext } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('hb_cart');
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch {}
    }
  }, []);

  const persist = (next) => {
    setItems(next);
    localStorage.setItem('hb_cart', JSON.stringify(next));
  };

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const exists = prev.find(i => i.product_id === product.product_id);
      const next = exists
        ? prev.map(i => i.product_id === product.product_id
            ? { ...i, quantity: i.quantity + qty }
            : i)
        : [...prev, { ...product, quantity: qty }];
      localStorage.setItem('hb_cart', JSON.stringify(next));
      return next;
    });
  };

  const removeItem = (productId) => {
    const next = items.filter(i => i.product_id !== productId);
    persist(next);
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) { removeItem(productId); return; }
    const next = items.map(i => i.product_id === productId ? { ...i, quantity: qty } : i);
    persist(next);
  };

  const clearCart = () => persist([]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
