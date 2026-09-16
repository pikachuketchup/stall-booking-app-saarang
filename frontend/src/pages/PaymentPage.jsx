import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  Receipt,
  User,
  Box,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export default function PaymentPage() {
  const { username, selectedBoxes, clearSelection } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onClose: () => {},
  });

  // If no username or no selected boxes, redirect back to booking
  useEffect(() => {
    if (!username) {
      navigate('/');
    } else if (selectedBoxes.length === 0) {
      navigate('/booking');
    }
  }, [username, selectedBoxes, navigate]);

  // Pricing constants
  const PRICE_PER_BOX = 25;
  const subtotal = selectedBoxes.length * PRICE_PER_BOX;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Handle "Payment Done" button
  const handlePaymentDone = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/boxes/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          boxIds: selectedBoxes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment processing failed');
      }

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#38bdf8', '#fbbf24'],
        });
      } catch (e) {
        // ignore if confetti fails
      }

      // Clear selected boxes in context
      clearSelection();

      // Show Payment Successful Modal and redirect to booking page
      setModalState({
        isOpen: true,
        title: 'Payment Successful!',
        message: `Your payment of $${total.toFixed(2)} was processed successfully. Box(es) #${selectedBoxes.join(', #')} are now reserved under your name!`,
        type: 'success',
        onClose: () => navigate('/booking'),
      });

      // Auto redirect after 2.5 seconds
      setTimeout(() => {
        navigate('/booking');
      }, 2500);
    } catch (err) {
      setModalState({
        isOpen: true,
        title: 'Booking Error',
        message: err.message || 'An error occurred while confirming your booking.',
        type: 'error',
        onClose: () => {},
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle "Payment Cannot Be Done" button
  const handlePaymentCannotBeDone = () => {
    // Clear the active selection
    clearSelection();

    // Show Payment Unsuccessful Modal and redirect back to booking page
    setModalState({
      isOpen: true,
      title: 'Payment Unsuccessful',
      message: 'The transaction could not be completed. Your selected boxes were not booked.',
      type: 'error',
      onClose: () => navigate('/booking'),
    });

    // Auto redirect after 2.5 seconds
    setTimeout(() => {
      navigate('/booking');
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/booking')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Booking Grid</span>
        </button>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2 inline-block">
                STEP 3 OF 3: CHECKOUT
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Order & Payment
              </h1>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Receipt className="w-6 h-6" />
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs text-slate-400">Billing User</div>
                  <div className="text-sm font-semibold text-white">{username}</div>
                </div>
              </div>
              <div className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Verified Session
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                  <Box className="w-4 h-4 text-indigo-400" />
                  <span>Selected Boxes ({selectedBoxes.length})</span>
                </div>
                <span className="text-xs text-slate-400">${PRICE_PER_BOX}.00 / box</span>
              </div>

              {/* Badges of selected box numbers */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedBoxes.map((id) => (
                  <span
                    key={id}
                    className="px-3 py-1 rounded-lg bg-indigo-950 border border-indigo-800/80 text-indigo-200 text-xs font-semibold"
                  >
                    Box #{id}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({selectedBoxes.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2.5 flex justify-between text-base font-bold text-white">
                <span>Total Amount Due</span>
                <span className="text-emerald-400 text-lg">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Action Buttons */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-2">
              Select Payment Outcome
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Button 1: Payment Done */}
              <button
                onClick={handlePaymentDone}
                disabled={loading}
                className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-600/25 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{loading ? 'Processing...' : 'Payment Done'}</span>
              </button>

              {/* Button 2: Payment Cannot Be Done */}
              <button
                onClick={handlePaymentCannotBeDone}
                disabled={loading}
                className="w-full py-4 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-base shadow-xl shadow-rose-600/25 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
                <span>Payment Cannot Be Done</span>
              </button>
            </div>
          </div>

          {/* Secure note */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Simulated Instant Payment Gateway with MySQL Sync</span>
          </div>
        </div>
      </div>

      {/* Outcome Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={modalState.onClose}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        cancelText="Return to Booking"
      />
    </div>
  );
}
