'use client';

import { useEffect } from 'react';
import { useHelpDialog } from '@/lib/contexts/HelpDialogContext';

export default function HelpDialogContent() {
  const { isOpen, closeDialog: onClose } = useHelpDialog();
  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-start justify-center pt-[5vh] pb-[5vh] px-4 overflow-y-auto bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      style={{ margin: 0 }}
    >
      {/* Dialog Container */}
      <div
        className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl my-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">📖 Hướng dẫn sử dụng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-6">
            {/* Section 1: Cài đặt CLI */}
            <section>
              <h3 className="text-xl font-bold mb-3 text-blue-400">📦 Cách 1: Cài đặt nhanh (khuyên dùng)</h3>
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                <p className="font-semibold text-gray-200">Chạy lệnh sau trong Command Prompt hoặc PowerShell:</p>
                <div className="bg-gray-900 rounded px-3 py-2 font-mono text-sm text-green-400 overflow-x-auto">
                  npx @duonghuyhieu/game-saver@latest
                </div>
                <p className="text-sm text-gray-400">⚠️ Yêu cầu: Node.js 16+ đã cài đặt</p>
              </div>
            </section>

            {/* Section 2: Cách dùng CLI */}
            <section>
              <h3 className="text-xl font-bold mb-3 text-blue-400">🎮 Cách sử dụng CLI</h3>
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="font-semibold mb-2 text-gray-200">Bước 1: Đăng nhập/Đăng ký</p>
                  <p className="text-sm text-gray-300">• Chọn "Dang nhap" hoặc "Dang ky" từ menu chính</p>
                  <p className="text-sm text-gray-300">• Nhập username/email và password</p>
                </div>

                <div>
                  <p className="font-semibold mb-2 text-gray-200">Bước 2: Chọn game</p>
                  <p className="text-sm text-gray-300">• Xem danh sách tất cả game có sẵn</p>
                  <p className="text-sm text-gray-300">• Chọn game bạn muốn quản lý save</p>
                </div>

                <div>
                  <p className="font-semibold mb-2 text-gray-200">Bước 3: Tải game (nếu chưa có)</p>
                  <p className="text-sm text-gray-300">• Chọn "Tai game" để xem link download</p>
                  <p className="text-sm text-gray-300">• CLI sẽ tự động mở link trong trình duyệt</p>
                </div>

                <div>
                  <p className="font-semibold mb-2 text-gray-200">Bước 4: Quản lý Save Files</p>
                  <p className="text-sm text-gray-300">• <strong>Upload:</strong> Backup save từ máy lên cloud</p>
                  <p className="text-sm text-gray-300">• <strong>Download:</strong> Tải save về và tự động ghi vào game</p>
                  <p className="text-sm text-gray-300">• Save sẽ tự động đồng bộ vào đúng thư mục game</p>
                </div>
              </div>
            </section>

            {/* Section 3: Tính năng */}
            <section>
              <h3 className="text-xl font-bold mb-3 text-blue-400">✨ Tính năng chính</h3>
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                <p className="text-gray-200">• 🔐 Đăng nhập/đăng ký tài khoản</p>
                <p className="text-gray-200">• 📋 Xem danh sách tất cả game</p>
                <p className="text-gray-200">• 💾 Tải link download game</p>
                <p className="text-gray-200">• ☁️ Upload save lên cloud để backup</p>
                <p className="text-gray-200">• 📥 Download save về máy tự động</p>
                <p className="text-gray-200">• 🔄 Đồng bộ save giữa nhiều máy</p>
                <p className="text-gray-200">• 🌍 Tải save public từ admin</p>
              </div>
            </section>

            {/* Section 4: Đồng bộ nhiều máy */}
            <section>
              <h3 className="text-xl font-bold mb-3 text-blue-400">🔄 Đồng bộ giữa nhiều máy</h3>
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-gray-200">Máy 1:</p>
                <p className="text-sm text-gray-300">1. Chạy CLI và đăng nhập</p>
                <p className="text-sm text-gray-300">2. Chọn game và upload save lên cloud</p>

                <p className="font-semibold mt-3 text-gray-200">Máy 2:</p>
                <p className="text-sm text-gray-300">1. Chạy CLI và đăng nhập cùng tài khoản</p>
                <p className="text-sm text-gray-300">2. Chọn game và download save về</p>
                <p className="text-sm text-gray-300">3. Save tự động ghi vào thư mục game!</p>
              </div>
            </section>

            {/* Tips */}
            <section className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2 text-blue-400">💡 Mẹo hay:</h3>
              <ul className="space-y-1 text-sm text-gray-200">
                <li>• Thường xuyên upload save để backup an toàn</li>
                <li>• Tải save public để có full progress ngay</li>
                <li>• CLI hoạt động trên Windows, macOS và Linux</li>
                <li>• Không cần mở web, CLI hoạt động độc lập</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-700 p-4 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors font-semibold text-white"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
