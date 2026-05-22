import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { AdminAuthProvider } from './hooks/useAdminAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import { Login, Register } from './pages/Auth';
import Orders from './pages/Orders';
import Vendors from './pages/Vendors';
import Track from './pages/Track';
import Admin from './pages/Admin';
import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/track" element={<Track />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}