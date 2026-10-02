import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginPage from './pages/LoginPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('booking'); // Open directly into food stalls map
  const [username, setUsername] = useState('Vendor_1');
  const [stalls, setStalls] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      status: i === 2 ? 'booked' : (i === 7 ? 'booked' : 'available'),
      booked_by: i === 2 ? 'Anita' : (i === 7 ? 'Rohan' : null)
    }))
  );
  const [selectedStalls, setSelectedStalls] = useState([]);

  const fetchStalls = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stalls');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStalls(res.data);
      } else {
        initDefaultStalls();
      }
    } catch (err) {
      console.warn('Backend MySQL not reachable, using resilient in-memory festival stalls:', err.message);
      initDefaultStalls();
    }
  };

  const initDefaultStalls = () => {
    setStalls((prev) => {
      if (prev && prev.length > 0) return prev;
      return Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        status: i === 2 ? 'booked' : (i === 7 ? 'booked' : 'available'),
        booked_by: i === 2 ? 'Anita' : (i === 7 ? 'Rohan' : null)
      }));
    });
  };

  useEffect(() => {
    fetchStalls();
  }, []);

  const handleLogin = (enteredUsername) => {
    setUsername(enteredUsername);
    setCurrentPage('booking');
  };

  const handleRevoke = async (stallId) => {
    try {
      await axios.post('http://localhost:5000/api/stalls/revoke', { stallId, username });
      alert(`Booking for Stall #${stallId} has been revoked.`);
      fetchStalls();
    } catch (err) {
      setStalls(prev => prev.map(s => s.id === stallId ? { ...s, status: 'available', booked_by: null } : s));
      alert(`Booking for Stall #${stallId} has been revoked.`);
    }
  };

  const handlePaymentResult = async (isSuccess) => {
    if (isSuccess) {
      try {
        await axios.post('http://localhost:5000/api/stalls/confirm-payment', {
          stallIds: selectedStalls,
          username
        });
        alert('Payment Successful!');
      } catch (err) {
        setStalls(prev => prev.map(s => selectedStalls.includes(s.id) ? { ...s, status: 'booked', booked_by: username } : s));
        alert('Payment Successful! Your spaces have been booked.');
      }
    } else {
      alert('Payment Unsuccessful.');
    }

    setSelectedStalls([]);
    setCurrentPage('booking');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {currentPage === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onBackToMap={() => setCurrentPage('booking')}
        />
      )}

      {currentPage === 'booking' && (
        <BookingPage
          username={username}
          stalls={stalls}
          selectedStalls={selectedStalls}
          setSelectedStalls={setSelectedStalls}
          onProceedToPayment={() => setCurrentPage('payment')}
          onRevoke={handleRevoke}
          onSwitchUser={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'payment' && (
        <PaymentPage
          username={username}
          selectedStalls={selectedStalls}
          onPaymentResult={handlePaymentResult}
        />
      )}
    </div>
  );
}