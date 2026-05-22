import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('hb_customer');
    if (stored) {
      try { setCustomer(JSON.parse(stored)); } catch {}
    }
  }, []);

  const login = (customerData) => {
    setCustomer(customerData);
    localStorage.setItem('hb_customer', JSON.stringify(customerData));
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('hb_customer');
  };

  return (
    <AuthContext.Provider value={{ customer, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}