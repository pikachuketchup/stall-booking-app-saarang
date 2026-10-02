import React, { useState } from 'react';

export default function LoginPage({ onLogin, onBackToMap }) {
  const [inputUsername, setInputUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(inputUsername.trim() || 'Vendor_1');
  };

  return (
    <div className="auth-page-container">
      <div className="card">
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎪</div>
        <h2>Food Stall Booking Portal</h2>
        <p>Saarang Festival Interactive Map & Booking</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Username (default: Vendor_1)"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
          />
          <br /><br />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '0.6rem' }}>
            Enter Food Stalls Map →
          </button>
          {onBackToMap && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={onBackToMap}
            >
              ← Back to Map View
            </button>
          )}
        </form>
      </div>
    </div>
  );
}