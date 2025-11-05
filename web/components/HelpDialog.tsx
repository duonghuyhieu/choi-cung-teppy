'use client';

import { useState } from 'react';

export default function HelpDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
      >
        💡 Hướng dẫn
      </button>

      {/* Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setIsOpen(false)}>
          <div
            className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">📖 Hướng dẫn sử dụng</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-6">
              {/* Section 1: Tải Game */}
              <section>
                <h3 className="text-xl font-bold mb-3 text-blue-400">1. Tải Game</h3>
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <p>• Xem danh sách game trên trang chủ</p>
                  <p>• Click vào game bạn muốn tải</p>
                  <p>• Chọn platform (Windows/macOS) và click nút "Tải"</p>
                  <p>• Giải nén và cài đặt game</p>
                </div>
              </section>

              {/* Section 2: Sử dụng Desktop App */}
              <section>
                <h3 className="text-xl font-bold mb-3 text-blue-400">2. Sử dụng Desktop App</h3>
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <p className="font-semibold">Bước 1: Cài đặt</p>
                  <div className="bg-gray-900 rounded px-3 py-2 font-mono text-sm text-green-400">
                    npx game-saver
                  </div>
                  <p className="text-sm text-gray-400">* Yêu cầu: Node.js 16+ đã cài đặt</p>

                  <p className="font-semibold mt-4">Bước 2: Sử dụng GUI</p>
                  <p>• Ứng dụng sẽ mở giao diện đồ họa</p>
                  <p>• Chọn game từ danh sách</p>
                  <p>• Upload save file của bạn lên cloud</p>
                  <p>• Hoặc download save file public về máy</p>
                  <p>• Save sẽ tự động sync vào đúng thư mục game</p>
                </div>
              </section>

              {/* Section 3: Quản lý Save Files */}
              <section>
                <h3 className="text-xl font-bold mb-3 text-blue-400">3. Quản lý Save Files</h3>
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <p>• <strong>Upload:</strong> Backup save game lên cloud</p>
                  <p>• <strong>Download:</strong> Tải save về và tự động ghi vào thư mục game</p>
                  <p>• <strong>Public saves:</strong> Tải các save công khai do admin chia sẻ</p>
                  <p>• Save files được tự động tìm kiếm dựa trên đường dẫn cấu hình</p>
                </div>
              </section>

              {/* Section 4: Đồng bộ nhiều máy */}
              <section>
                <h3 className="text-xl font-bold mb-3 text-blue-400">4. Đồng bộ giữa nhiều máy</h3>
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <p>• Chạy <code className="bg-gray-900 px-2 py-1 rounded">npx game-saver</code> trên máy thứ nhất</p>
                  <p>• Upload save file lên cloud</p>
                  <p>• Chạy <code className="bg-gray-900 px-2 py-1 rounded">npx game-saver</code> trên máy thứ hai</p>
                  <p>• Download save file về để tiếp tục chơi</p>
                  <p>• Save sẽ được tự động ghi vào đúng thư mục game</p>
                </div>
              </section>

              {/* Section 5: Admin */}
              <section>
                <h3 className="text-xl font-bold mb-3 text-blue-400">5. Dành cho Admin</h3>
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <p>• Truy cập <code className="bg-gray-900 px-2 py-1 rounded">/admin</code> để đăng nhập</p>
                  <p>• Thêm game mới với thông tin và link tải</p>
                  <p>• Cấu hình đường dẫn save file cho từng game</p>
                  <p>• Quản lý download links cho nhiều platform</p>
                </div>
              </section>

              {/* Tips */}
              <section className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2 text-blue-400">💡 Mẹo hay:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Thường xuyên backup save để tránh mất dữ liệu</li>
                  <li>• Sử dụng save public để thử nghiệm game nhanh hơn</li>
                  <li>• Desktop app hoạt động offline sau khi tải save</li>
                </ul>
              </section>
            </div>

            {/* Dialog Footer */}
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
