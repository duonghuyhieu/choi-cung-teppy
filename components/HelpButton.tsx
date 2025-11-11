'use client';

interface HelpButtonProps {
  onClick: () => void;
}

export default function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
    >
      💡 Hướng dẫn
    </button>
  );
}
