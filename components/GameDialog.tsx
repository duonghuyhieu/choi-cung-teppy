'use client';

import { Game, CreateGameDto, UpdateGameDto } from '@/types';
import GameForm from './GameForm';

interface GameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  game?: Game;
  onSubmit: (data: CreateGameDto | UpdateGameDto, links?: { title: string; url: string }[]) => Promise<void>;
  isLoading?: boolean;
}

export default function GameDialog({ isOpen, onClose, mode, game, onSubmit, isLoading }: GameDialogProps) {
  if (!isOpen) return null;

  const title = mode === 'create' ? 'Thêm Game Mới' : mode === 'edit' ? 'Sửa Game' : 'Chi tiết Game';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <GameForm
            mode={mode}
            game={game}
            gameId={game?.id}
            onSubmit={async (data, links) => {
              await onSubmit(data, links);
              onClose();
            }}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
