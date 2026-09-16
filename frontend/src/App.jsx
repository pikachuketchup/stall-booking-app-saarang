import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UsernamePage from './pages/UsernamePage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';

export default function App() {
  const [dbDriver, setDbDriver] = useState('MySQL');

  useEffect(() => {
    // Check backend status and driver on mount
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.driver) {
          setDbDriver(data.driver);
        }
      })
      .catch(() => {
        // Backend not ready yet
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar dbDriver={dbDriver} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<UsernamePage />} />
          <Route
            path="/booking"
            element={<BookingPage onRefreshDriver={(driver) => setDbDriver(driver)} />}
          />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
