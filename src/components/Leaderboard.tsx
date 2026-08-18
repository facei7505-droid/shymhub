import React, { useState } from 'react';
import { Trophy, Search, MapPin, Shield, Check, Clock } from 'lucide-react';
import type { Problem, District, Category, User, ThemeMode, Language } from '../types';
import { TRANSLATIONS, getDistrictLabel, getCategoryLabel } from '../i18n/translations';

interface LeaderboardProps {
  problems: Problem[];
  currentUser?: User | null;
  theme?: ThemeMode;
  language?: Language;
  onStatusChange?: (problemId: string, status: Problem['status']) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  problems,
  currentUser,
  theme = 'dark',
  language = 'ru',
  onStatusChange,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isDark = theme === 'dark';
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;

  const districts: District[] = ['Аль-Фарабийский', 'Енбекшинский', 'Абайский', 'Каратауский', 'Туран'];
  const categories: Category[] = ['roads', 'lighting', 'garbage', 'utilities', 'ecology', 'infrastructure'];

  const filteredProblems = [...problems]
    .filter((p) => {
      const matchDistrict = selectedDistrict === 'all' || p.district === selectedDistrict;
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchDistrict && matchCategory && matchSearch;
    })
    .sort((a, b) => b.eloRating - a.eloRating);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            {t('leaderboardBadge')}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('leaderboardTitle')}
            </h2>
            {currentUser?.role === 'inspector' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-xs font-bold">
                <Shield className="w-3.5 h-3.5" /> {t('inspectorMode')}
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('leaderboardSubtitle')}
          </p>
        </div>

        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${
          isDark ? 'bg-[#131B2E]/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`text-xs pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-rose-500 w-64 transition-all ${
                isDark
                  ? 'bg-[#0B0F19] text-white border-slate-800 placeholder:text-slate-500'
                  : 'bg-slate-50 text-slate-900 border-slate-200 placeholder:text-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* District Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => setSelectedDistrict('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedDistrict === 'all'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25'
                : isDark
                ? 'bg-[#131B2E] text-slate-400 hover:text-slate-200 border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            {t('allDistricts')}
          </button>
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDistrict === d
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25'
                  : isDark
                  ? 'bg-[#131B2E] text-slate-400 hover:text-slate-200 border border-slate-800'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
              }`}
            >
              {getDistrictLabel(d, language)}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900 font-bold'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('allCategories')}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                selectedCategory === c
                  ? isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900 font-bold'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {getCategoryLabel(c, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table / Cards List */}
      <div className="space-y-3">
        {filteredProblems.map((problem, index) => {
          const winRate = problem.matchesPlayed > 0
            ? Math.round((problem.winsCount / problem.matchesPlayed) * 100)
            : 0;

          const isTop3 = index < 3;
          const rankColors = [
            'bg-amber-400 text-slate-950 font-black',
            'bg-slate-300 text-slate-950 font-black',
            'bg-amber-700 text-white font-black',
          ];

          const districtName = getDistrictLabel(problem.district, language);

          return (
            <div
              key={problem.id}
              className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                isDark
                  ? `bg-[#131B2E]/90 hover:bg-[#18233C] hover:border-slate-700 ${
                      isTop3 ? 'border-amber-500/30 shadow-lg shadow-amber-500/5' : 'border-slate-800/80'
                    }`
                  : `bg-white hover:bg-slate-50/80 hover:border-slate-300 shadow-sm ${
                      isTop3 ? 'border-amber-400/40 ring-1 ring-amber-400/20' : 'border-slate-200'
                    }`
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-mono shrink-0 ${
                    isTop3
                      ? rankColors[index]
                      : isDark
                      ? 'bg-[#0B0F19] text-slate-400 border border-slate-800 font-bold'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 font-bold'
                  }`}
                >
                  #{index + 1}
                </div>

                <img
                  src={problem.imageUrl}
                  alt={problem.title}
                  className={`w-16 h-16 rounded-xl object-cover shrink-0 border ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-bold text-base group-hover:text-rose-400 transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {problem.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isDark ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {districtName}
                    </span>
                  </div>

                  <p className={`text-xs line-clamp-1 leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {problem.description}
                  </p>

                  {problem.address && (
                    <p className={`text-[11px] flex items-center gap-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {problem.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats & Inspector Controls */}
              <div className={`flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 shrink-0 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                
                {/* Elo Rating */}
                <div className="text-right">
                  <div className="text-lg font-mono font-black text-rose-400">
                    {problem.eloRating}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-400'
                  }`}>
                    {t('eloRating')}
                  </div>
                </div>

                {/* Win Rate */}
                <div className="text-right">
                  <div className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {winRate}%
                  </div>
                  <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {problem.winsCount}/{problem.matchesPlayed} {t('wins')}
                  </div>
                </div>

                {/* Status & Inspector action */}
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      problem.status === 'in_progress'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : problem.status === 'resolved'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {problem.status === 'in_progress' ? t('inWork') : problem.status === 'resolved' ? t('resolved') : t('needsAttention')}
                  </span>

                  {currentUser?.role === 'inspector' && onStatusChange && (
                    <div className="flex items-center gap-1 pt-1">
                      {problem.status !== 'in_progress' && (
                        <button
                          onClick={() => onStatusChange(problem.id, 'in_progress')}
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[10px] font-semibold border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1"
                          title={t('takeToWork')}
                        >
                          <Clock className="w-3 h-3" /> {t('takeToWork')}
                        </button>
                      )}
                      {problem.status !== 'resolved' && (
                        <button
                          onClick={() => onStatusChange(problem.id, 'resolved')}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1"
                          title={t('markResolved')}
                        >
                          <Check className="w-3 h-3" /> {t('resolved')}
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          );
        })}

        {filteredProblems.length === 0 && (
          <div className={`text-center py-12 rounded-2xl border ${
            isDark ? 'text-slate-500 bg-[#131B2E]/50 border-slate-800' : 'text-slate-500 bg-white border-slate-200'
          }`}>
            {t('nothingFound')}
          </div>
        )}
      </div>

    </div>
  );
};
