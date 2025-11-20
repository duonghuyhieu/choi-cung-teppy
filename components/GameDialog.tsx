'use client';

import { createPortal } from 'react-dom';
import { Game, CreateGameDto, UpdateGameDto } from '@/types';
import GameFormMultiVersion from './admin/GameFormMultiVersion';

interface GameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  game?: Game;
  onSubmit: (data: CreateGameDto | UpdateGameDto) => Promise<void>;
  isLoading?: boolean;
}

export default function GameDialog({ isOpen, onClose, mode, game, onSubmit, isLoading }: GameDialogProps) {
  if (!isOpen) return null;

  // GameFormSimple không hỗ trợ view mode, chuyển sang edit
  const formMode = mode === 'view' ? 'edit' : mode;

  const dialogContent = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Thêm Game Mới' : mode === 'edit' ? 'Sửa Game' : 'Chi tiết Game'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <GameFormMultiVersion
            mode={formMode}
            game={game}
            gameId={game?.id}
            onSubmit={async (data) => {
              await onSubmit(data);
              onClose();
            }}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(dialogContent, document.body) : null;
}
