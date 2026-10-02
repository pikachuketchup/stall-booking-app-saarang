import React from 'react';

export default function PaymentPage({ username, selectedStalls, onPaymentResult }) {
  const estimatedTotal = selectedStalls.length * 4000;

  return (
    <div className="auth-page-container">
      <div className="card">
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💳</div>
        <h2>Payment Gateway</h2>
        <p>Confirm booking for selected festival spaces</p>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'left',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Account:</span>
            <strong>{username}</strong>
          </div>
          <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Stalls to Book:</span>
            <strong>{selectedStalls.map(id => `Stall #${id}`).join(', ')}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
            <span style={{ color: '#64748b' }}>Estimated Total:</span>
            <strong style={{ color: '#4f46e5', fontSize: '1.1rem' }}>₹{estimatedTotal.toLocaleString()}</strong>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => onPaymentResult(true)} className="btn btn-success" style={{ width: '100%' }}>
            ✓ Confirm Payment Done
          </button>
          <button onClick={() => onPaymentResult(false)} className="btn btn-danger" style={{ width: '100%' }}>
            ✕ Cancel / Payment Failed
          </button>
        </div>
      </div>
    </div>
  );
}