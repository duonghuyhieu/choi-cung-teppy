'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const iconConfig = {
  info: {
    icon: <Info size={48} />,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-blue-600/20',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
  },
  success: {
    icon: <CheckCircle size={48} />,
    color: 'text-green-400',
    gradient: 'from-green-500/20 to-green-600/20',
    border: 'border-green-500/30',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]'
  },
  warning: {
    icon: <AlertTriangle size={48} />,
    color: 'text-yellow-400',
    gradient: 'from-yellow-500/20 to-yellow-600/20',
    border: 'border-yellow-500/30',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]'
  },
  error: {
    icon: <AlertCircle size={48} />,
    color: 'text-red-400',
    gradient: 'from-red-500/20 to-red-600/20',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]'
  },
  confirm: {
    icon: <AlertTriangle size={48} />,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-purple-600/20',
    border: 'border-purple-500/30',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]'
  },
};

const buttonConfig = {
  info: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600',
  success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600',
  warning: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600',
  error: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600',
  confirm: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600',
};

export default function Dialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
}: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (onCancel) {
          onCancel();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, onCancel]);

  if (!isOpen) return null;

  const config = iconConfig[type];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const dialogContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className={`relative bg-gradient-to-br ${config.gradient} backdrop-blur-xl rounded-2xl ${config.glow} max-w-md w-full border ${config.border} overflow-hidden`}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Close button */}
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>

          {/* Icon */}
          <div className="flex justify-center pt-8 pb-4">
            <div className={`${config.color}`}>
              {config.icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white text-center px-6 mb-2">
            {title || (
              type === 'confirm' ? 'Xác nhận' :
              type === 'error' ? 'Lỗi' :
              type === 'success' ? 'Thành công' :
              type === 'warning' ? 'Cảnh báo' :
              'Thông báo'
            )}
          </h3>

          {/* Message */}
          <div className="px-8 pb-6 text-center">
            <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-6 pb-6 justify-center">
            {type === 'confirm' && (
              <button
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50 hover:scale-105 active:scale-95 min-w-[100px]"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${buttonConfig[type]} text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 min-w-[100px]`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(dialogContent, document.body) : null;
}
