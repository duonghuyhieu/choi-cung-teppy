'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GameWithLinks, ApiResponse } from '@/types';
import Navigation from '@/components/Navigation';

async function fetchGames(): Promise<GameWithLinks[]> {
  const response = await fetch('/api/games');
  const data: ApiResponse<GameWithLinks[]> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch games');
  }

  return data.data || [];
}

const ITEMS_PER_PAGE = 9;

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'crack' | 'steam_online' | 'steam_offline'>('all');

  const { data: games, isLoading, error } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
  });

  // Filter and search games
  const filteredGames = games?.filter((game) => {
    // Search filter
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = selectedFilter === 'all' || game.game_type?.includes(selectedFilter);

    return matchesSearch && matchesType;
  }) || [];

  // Pagination calculations
  const totalGames = filteredGames.length;
  const totalPages = Math.ceil(totalGames / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when games data, search, or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [games, searchQuery, selectedFilter]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[var(--neon-cyan)] opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-[var(--neon-magenta)] opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-[var(--neon-purple)] opacity-8 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-6 text-[#FF10F0] drop-shadow-[0_0_30px_rgba(255,16,240,0.5)]">
            CHOI CUNG TEPPY
          </h1>
          <p className="text-2xl text-gray-200 font-semibold">
            Tải game và quản lý save game của bạn
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full"></span>
              Cloud Storage
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full"></span>
              Auto Sync
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--neon-magenta)] rounded-full"></span>
              Unlimited Games
            </span>
          </div>
        </header>

        {/* Games Section */}
        <main className="max-w-7xl mx-auto">
          <section className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] bg-clip-text text-transparent">
                  Danh sách Game
                </h2>
                <div className="h-px bg-gradient-to-r from-[var(--neon-cyan)] to-transparent w-20"></div>
              </div>
              {!isLoading && !error && totalGames > 0 && (
                <div className="text-gray-400 text-sm">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, totalGames)} của {totalGames} games
                </div>
              )}
            </div>

            {/* Search and Filter */}
            {!isLoading && !error && games && games.length > 0 && (
              <div className="mb-8">
                {/* Search Box and Filter Buttons in One Row */}
                <div className="flex flex-col lg:flex-row gap-3 mb-4">
                  {/* Search Box */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="🔍 Tìm kiếm game..."
                      className="w-full px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:border-[var(--neon-cyan)]/50 focus:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all text-white placeholder-gray-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedFilter('all')}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedFilter === 'all'
                          ? 'bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                          : 'glass border border-white/10 hover:border-[var(--neon-cyan)]/50'
                      }`}
                    >
                      🎮 Tất cả
                    </button>
                    <button
                      onClick={() => setSelectedFilter('crack')}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedFilter === 'crack'
                          ? 'bg-gradient-to-r from-green-600 to-green-700 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                          : 'glass border border-white/10 hover:border-green-500/50'
                      }`}
                    >
                      🔓 Crack
                    </button>
                    <button
                      onClick={() => setSelectedFilter('steam_offline')}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedFilter === 'steam_offline'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                          : 'glass border border-white/10 hover:border-blue-500/50'
                      }`}
                    >
                      🔵 Steam Offline
                    </button>
                    <button
                      onClick={() => setSelectedFilter('steam_online')}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedFilter === 'steam_online'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                          : 'glass border border-white/10 hover:border-purple-500/50'
                      }`}
                    >
                      🟣 Steam Online
                    </button>
                  </div>
                </div>

                {/* Result count */}
                {(searchQuery || selectedFilter !== 'all') && (
                  <div className="text-sm text-gray-400">
                    Tìm thấy <span className="text-[var(--neon-cyan)] font-semibold">{totalGames}</span> game
                    {searchQuery && <span> với từ khóa "{searchQuery}"</span>}
                    {selectedFilter !== 'all' && (
                      <span> - Loại: {
                        selectedFilter === 'crack' ? 'Crack' :
                        selectedFilter === 'steam_offline' ? 'Steam Offline' :
                        'Steam Online'
                      }</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--neon-cyan)] border-r-[var(--neon-magenta)]"></div>
                <p className="mt-6 text-xl text-[var(--neon-cyan)]">Loading games...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="glass-strong rounded-xl border border-[var(--neon-pink)] bg-[var(--neon-pink)]/10 px-6 py-4">
                <p className="text-[var(--neon-pink)] font-medium">Lỗi: {(error as Error).message}</p>
              </div>
            )}

            {/* Empty State - No games at all */}
            {!isLoading && !error && games && games.length === 0 && (
              <div className="text-center py-20 glass-strong rounded-2xl neon-border">
                <div className="text-8xl mb-6">🎮</div>
                <h2 className="text-3xl font-bold mb-3 neon-text-purple">Chưa có game nào</h2>
                <p className="text-gray-400 text-lg">Game sẽ được thêm sớm!</p>
              </div>
            )}

            {/* Empty State - No results found */}
            {!isLoading && !error && games && games.length > 0 && filteredGames.length === 0 && (
              <div className="text-center py-20 glass-strong rounded-2xl border border-white/10">
                <div className="text-8xl mb-6">🔍</div>
                <h2 className="text-3xl font-bold mb-3 text-white">Không tìm thấy kết quả</h2>
                <p className="text-gray-400 text-lg mb-6">
                  {searchQuery && `Không có game nào khớp với "${searchQuery}"`}
                  {selectedFilter !== 'all' && !searchQuery && `Không có game loại ${
                    selectedFilter === 'crack' ? 'Crack' :
                    selectedFilter === 'steam_offline' ? 'Steam Offline' :
                    'Steam Online'
                  }`}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Games Grid */}
            {!isLoading && !error && games && games.length > 0 && filteredGames.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentGames.map((game) => (
                  <Link
                    href={`/games/${game.id}`}
                    key={game.id}
                    className="group glass-strong rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] border border-white/10 hover:border-[var(--neon-cyan)]/50"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] flex items-center justify-center relative overflow-hidden">
                      {game.thumbnail_url ? (
                        <>
                          <img
                            src={game.thumbnail_url}
                            alt={game.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent opacity-60"></div>
                        </>
                      ) : (
                        <div className="text-7xl group-hover:scale-110 transition-transform duration-300">🎮</div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--neon-cyan)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-[var(--neon-cyan)] transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {game.description || 'Chưa có mô tả'}
                      </p>

                      {/* Download Count */}
                      {game.download_links && game.download_links.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[var(--neon-magenta)]">📥</span>
                          <span className="text-[var(--neon-cyan)] font-medium">
                            {game.download_links.length} link tải
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    {/* Page Info (Mobile) */}
                    <div className="sm:hidden text-gray-400 text-sm">
                      Trang {currentPage} / {totalPages}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg glass border border-white/10 hover:border-[var(--neon-cyan)]/50 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/10"
                      >
                        <span className="hidden sm:inline">← Trước</span>
                        <span className="sm:hidden">←</span>
                      </button>

                      {/* Page Numbers */}
                      <div className="hidden sm:flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1;

                        const showDots =
                          (page === 2 && currentPage > 3) ||
                          (page === totalPages - 1 && currentPage < totalPages - 2);

                        if (showDots) {
                          return (
                            <span key={page} className="px-3 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[40px] px-3 py-2 rounded-lg font-semibold transition-all duration-300 ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                                : 'glass border border-white/10 hover:border-[var(--neon-cyan)]/50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg glass border border-white/10 hover:border-[var(--neon-cyan)]/50 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/10"
                      >
                        <span className="hidden sm:inline">Sau →</span>
                        <span className="sm:hidden">→</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center mt-20 py-8 border-t border-white/10">
          <p className="text-gray-400">
            Choi Cung Teppy -
            <span className="text-[var(--neon-cyan)] ml-2">Quản lý save game dễ dàng</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
