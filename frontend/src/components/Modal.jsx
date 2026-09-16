import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, XCircle, AlertTriangle, X, Undo2 } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info', // 'info', 'warning', 'success', 'error', 'action'
  confirmText,
  onConfirm,
  confirmLoading = false,
  cancelText = 'Close',
  details = null,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-rose-500 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-amber-400" />;
      case 'action':
        return <Undo2 className="w-12 h-12 text-emerald-400" />;
      default:
        return <AlertCircle className="w-12 h-12 text-indigo-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30';
      case 'error':
        return 'border-rose-500/30';
      case 'warning':
        return 'border-amber-500/30';
      case 'action':
        return 'border-emerald-500/30';
      default:
        return 'border-indigo-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-md bg-slate-900 border ${getBorderColor()} rounded-2xl shadow-2xl p-6 sm:p-8 text-center transform transition-all scale-100 overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        {/* Glow effect in background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close icon button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">{getIcon()}</div>

        {/* Title */}
        {title && (
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {title}
          </h3>
        )}

        {/* Message */}
        {message && (
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            {message}
          </p>
        )}

        {/* Additional custom details / badge */}
        {details && (
          <div className="mb-6 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-sm text-slate-200">
            {details}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={confirmLoading}
              className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {confirmLoading ? 'Processing...' : confirmText || 'Confirm'}
            </button>
          )}

          <button
            onClick={onClose}
            className={`w-full sm:w-auto ${
              onConfirm ? 'sm:flex-1' : 'px-8'
            } py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium transition border border-slate-700`}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
