import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  CreditCard,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

export default function BookingPage({ onRefreshDriver }) {
  const { username, selectedBoxes, toggleBoxSelection, clearSelection } = useAuth();
  const navigate = useNavigate();

  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: null,
    onConfirm: null,
    details: null,
  });

  // Redirect if username not entered
  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  // Fetch Boxes from API
  const fetchBoxes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/boxes');
      const data = await res.json();
      if (res.ok && data.success) {
        setBoxes(data.boxes || []);
        if (onRefreshDriver && data.driver) {
          onRefreshDriver(data.driver);
        }
      } else {
        setError(data.error || 'Failed to fetch boxes');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }, [onRefreshDriver]);

  useEffect(() => {
    if (username) {
      fetchBoxes();
    }
  }, [username, fetchBoxes]);

  // Handle Box Clicks based on Color / State
  const handleBoxClick = (box) => {
    const isBooked = !!box.booked_by;
    const isBookedByMe = isBooked && box.booked_by.toLowerCase() === username.toLowerCase();
    const isBookedByOther = isBooked && !isBookedByMe;

    if (isBookedByOther) {
      // 🔴 Red Box Click -> Pop up stating it's booked by someone else
      setModalState({
        isOpen: true,
        title: 'Already Booked',
        message: `Box #${box.box_number} has been booked by someone else.`,
        type: 'error',
        details: (
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400">Booked by:</span>
            <span className="font-semibold text-rose-400">{box.booked_by}</span>
          </div>
        ),
        confirmText: null,
        onConfirm: null,
      });
    } else if (isBookedByMe) {
      // 🟢 Green Box Click -> Pop up stating user already booked this, with Revoke option
      setModalState({
        isOpen: true,
        title: `Your Booking (Box #${box.box_number})`,
        message: `You have already booked this box. Would you like to revoke this reservation?`,
        type: 'action',
        details: (
          <div className="text-xs text-slate-300">
            Revoking will release this box back into available (white) status for all users.
          </div>
        ),
        confirmText: 'Yes, Revoke Booking',
        onConfirm: () => handleRevoke(box.id),
      });
    } else {
      // ⚪ White Box Click -> Toggle selection for payment
      toggleBoxSelection(box.id);
    }
  };

  // Revoke a Booking
  const handleRevoke = async (boxId) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/boxes/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, boxId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to revoke booking');
      }

      // Close modal and refresh boxes
      setModalState((prev) => ({ ...prev, isOpen: false }));
      await fetchBoxes();
    } catch (err) {
      setModalState({
        isOpen: true,
        title: 'Revoke Failed',
        message: err.message,
        type: 'error',
        confirmText: null,
        onConfirm: null,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Bottom Center "Payment" Button Click Handler
  const handlePaymentClick = () => {
    if (selectedBoxes.length === 0) {
      // Popup if user hasn't clicked on any box
      setModalState({
        isOpen: true,
        title: 'No Boxes Selected',
        message: 'Please select at least one available (white) box to proceed to payment.',
        type: 'warning',
        confirmText: null,
        onConfirm: null,
      });
      return;
    }

    // Redirect to Payment Page
    navigate('/payment');
  };

  // Reset all boxes (convenient helper for testing)
  const handleResetAll = async () => {
    if (!window.confirm('Reset all box bookings in the database?')) return;
    try {
      const res = await fetch('/api/boxes/reset', { method: 'POST' });
      if (res.ok) {
        clearSelection();
        fetchBoxes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              STEP 2 OF 3
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Select Your Boxes
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Logged in as <span className="text-indigo-300 font-semibold">{username}</span>. Click on any available white box to select it.
          </p>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={fetchBoxes}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition"
            title="Refresh Box Statuses"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/40 text-xs font-medium transition"
            title="Clear all bookings for demo testing"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* Legend Card */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl mb-8 flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium">
          {/* White = Available */}
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-lg bg-white border border-slate-300 shadow-sm inline-block" />
            <span className="text-slate-200">White: Available</span>
          </div>

          {/* Green = Booked by current user */}
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-lg bg-emerald-500 border border-emerald-400 shadow-sm inline-block" />
            <span className="text-slate-200">Green: Booked by You (Click to Revoke)</span>
          </div>

          {/* Red = Booked by someone else */}
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-lg bg-rose-600 border border-rose-500 shadow-sm inline-block" />
            <span className="text-slate-200">Red: Booked by Others</span>
          </div>

          {/* Selected indicator */}
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-lg bg-indigo-100 border-2 border-indigo-600 ring-2 ring-indigo-500/50 shadow-sm inline-block" />
            <span className="text-indigo-300 font-semibold">Selected for Payment</span>
          </div>
        </div>

        {selectedBoxes.length > 0 && (
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {selectedBoxes.length} {selectedBoxes.length === 1 ? 'box' : 'boxes'} selected
          </div>
        )}
      </div>

      {/* Loading & Error States */}
      {loading && boxes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading boxes from database...</p>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Boxes */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        {boxes.map((box) => {
          const isBooked = !!box.booked_by;
          const isBookedByMe = isBooked && box.booked_by.toLowerCase() === username.toLowerCase();
          const isBookedByOther = isBooked && !isBookedByMe;
          const isSelected = selectedBoxes.includes(box.id);

          // Color & Styling logic
          let boxClasses = '';
          let statusLabel = '';
          let badgeText = '';

          if (isBookedByOther) {
            // 🔴 RED BOX
            boxClasses = 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-rose-900/30';
            statusLabel = `Booked by ${box.booked_by}`;
            badgeText = 'Booked';
          } else if (isBookedByMe) {
            // 🟢 GREEN BOX
            boxClasses = 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-400 shadow-emerald-900/30 ring-1 ring-emerald-300/30';
            statusLabel = 'Your Booking (Click to Revoke)';
            badgeText = 'Yours';
          } else if (isSelected) {
            // ⚪ SELECTED (WHITE WITH ACTIVE SELECTION RING)
            boxClasses = 'bg-slate-100 text-indigo-950 border-indigo-600 ring-4 ring-indigo-500/60 shadow-xl scale-105 transform';
            statusLabel = 'Selected';
            badgeText = 'Selected';
          } else {
            // ⚪ WHITE (AVAILABLE)
            boxClasses = 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-md hover:scale-102 transform';
            statusLabel = 'Available';
            badgeText = 'Available';
          }

          return (
            <button
              key={box.id}
              onClick={() => handleBoxClick(box)}
              className={`relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 aspect-square cursor-pointer select-none group shadow-lg ${boxClasses}`}
              title={`Box #${box.box_number} - ${statusLabel}`}
            >
              {/* Top status indicator */}
              <div className="w-full flex items-center justify-between text-[11px] font-semibold opacity-90">
                <span>#{box.box_number}</span>
                {isBookedByMe && <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded">MINE</span>}
                {isBookedByOther && <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded">TAKEN</span>}
                {isSelected && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded">READY</span>}
              </div>

              {/* Big Box Number */}
              <div className="my-auto text-2xl sm:text-3xl font-extrabold tracking-tight">
                {box.box_number}
              </div>

              {/* Bottom tag */}
              <div className="w-full text-center text-[10px] sm:text-xs font-semibold truncate capitalize opacity-90">
                {badgeText}
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Bottom Center Payment Bar & Button */}
      <div className="fixed bottom-6 inset-x-0 flex justify-center z-30 px-4 pointer-events-none">
        <div className="glass-panel p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-700/80 pointer-events-auto flex items-center gap-4 max-w-lg w-full">
          <div className="flex-1 pl-3 hidden sm:block">
            <div className="text-xs text-slate-400">Total Selected</div>
            <div className="text-sm font-bold text-white">
              {selectedBoxes.length} {selectedBoxes.length === 1 ? 'Box' : 'Boxes'}
              {selectedBoxes.length > 0 && (
                <span className="text-indigo-400 ml-2 font-normal">
                  (IDs: {selectedBoxes.join(', ')})
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handlePaymentClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition transform hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-5 h-5" />
            <span>Proceed to Payment</span>
            {selectedBoxes.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {selectedBoxes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Modal Dialog */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        details={modalState.details}
        confirmText={modalState.confirmText}
        onConfirm={modalState.onConfirm}
        confirmLoading={actionLoading}
      />
    </div>
  );
}
