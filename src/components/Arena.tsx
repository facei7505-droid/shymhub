import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw, CheckCircle2, Lock, Flame, MapPin } from 'lucide-react';
import type { Problem, User, AppSettings, ThemeMode, Language } from '../types';
import { getPairToVote, recordVote } from '../utils/storage';
import { soundEngine } from '../utils/audio';
import { TRANSLATIONS, getDistrictLabel, getCategoryLabel } from '../i18n/translations';
import { handleImageError } from '../utils/images';
import { getPriorityFromElo } from '../utils/priority';

interface ArenaProps {
  currentUser: User | null;
  settings: AppSettings;
  theme?: ThemeMode;
  language?: Language;
  onRequireAuth: () => void;
  onVoteCompleted: () => void;
  // kept in interface for backward-compat with App.tsx but unused
  streakCount?: number;
  setStreakCount?: React.Dispatch<React.SetStateAction<number>>;
}

export const Arena: React.FC<ArenaProps> = ({
  currentUser,
  settings,
  theme = 'dark',
  language = 'ru',
  onRequireAuth,
  onVoteCompleted,
}) => {
  const [pair, setPair] = useState<[Problem, Problem] | null>(null);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(null);
  const [recentPairs, setRecentPairs] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const isDark = theme === 'dark';
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;

  const loadNextPair = useCallback(() => {
    setIsTransitioning(true);
    setSelectedWinnerId(null);

    const nextPair = getPairToVote(recentPairs.slice(-6));
    if (nextPair) {
      setPair(nextPair);
      setRecentPairs((prev) => [...prev, nextPair[0].id, nextPair[1].id]);
    }
    setTimeout(() => setIsTransitioning(false), 200);
  }, [recentPairs]);

  useEffect(() => {
    loadNextPair();
  }, []);

  const handleVote = (winner: Problem, loser: Problem) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (selectedWinnerId || isTransitioning) return;

    if (settings.soundEnabled) {
      soundEngine.playVote();
    }

    setSelectedWinnerId(winner.id);
    // Elo is recalculated mathematically in storage (hidden from the user)
    recordVote(winner.id, loser.id, currentUser.id);
    onVoteCompleted();

    setTimeout(() => {
      loadNextPair();
    }, settings.autoSkipDelayMs || 500);
  };

  useEffect(() => {
    if (!settings.keyboardShortcutsEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pair || selectedWinnerId || isTransitioning) return;
      if (e.key === 'ArrowLeft' || e.key === '1') {
        handleVote(pair[0], pair[1]);
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        handleVote(pair[1], pair[0]);
      } else if (e.key === ' ') {
        e.preventDefault();
        loadNextPair();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pair, selectedWinnerId, isTransitioning, loadNextPair, currentUser, settings]);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between py-6 px-4 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          {t('arenaBadge')}
        </div>

        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight ${
          isDark
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300'
            : 'text-slate-900'
        }`}>
          {t('arenaTitle')}
        </h1>

        <p className={`text-xs sm:text-sm max-w-lg mx-auto ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {t('arenaSubtitle')}
        </p>

        {/* Guest Warning Banner */}
        {!currentUser && (
          <div
            onClick={onRequireAuth}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-semibold cursor-pointer transition-all shadow-md ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('guestBanner')}</span>
          </div>
        )}
      </div>

      {/* Arena Duel Cards Area */}
      <div className="w-full my-auto py-2">
        {pair ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 relative items-stretch">
            
            {/* Center VS Indicator */}
            <div className={`hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 shadow-2xl items-center justify-center z-30 pointer-events-none ${
              isDark ? 'bg-[#0B0F19] border-slate-700 shadow-cyan-500/20' : 'bg-white border-slate-200 shadow-xl'
            }`}>
              <span className="font-black text-xs tracking-widest text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20">
                VS
              </span>
            </div>

            {/* Left Card */}
            <DuelCard
              problem={pair[0]}
              shortcut="1"
              isWinner={selectedWinnerId === pair[0].id}
              isLoser={selectedWinnerId !== null && selectedWinnerId !== pair[0].id}
              disabled={selectedWinnerId !== null}
              isGuest={!currentUser}
              isDark={isDark}
              language={language}
              t={t}
              onSelect={() => handleVote(pair[0], pair[1])}
            />

            {/* Right Card */}
            <DuelCard
              problem={pair[1]}
              shortcut="2"
              isWinner={selectedWinnerId === pair[1].id}
              isLoser={selectedWinnerId !== null && selectedWinnerId !== pair[1].id}
              disabled={selectedWinnerId !== null}
              isGuest={!currentUser}
              isDark={isDark}
              language={language}
              t={t}
              onSelect={() => handleVote(pair[1], pair[0])}
            />
          </div>
        ) : (
          <div className={`h-96 flex flex-col items-center justify-center text-center p-6 rounded-3xl border ${
            isDark ? 'bg-[#131B2E] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
          } space-y-3`}>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Нет активных проблем для дуэли
              </h3>
              <p className="text-xs max-w-sm">
                База данных готова к синхронизации с FastAPI backend. Добавьте новую городскую проблему через кнопку «Сообщить».
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className={`w-full flex items-center justify-between text-xs pt-4 border-t mt-4 ${
        isDark ? 'text-slate-500 border-slate-800/80' : 'text-slate-600 border-slate-200'
      }`}>
        <div className="hidden sm:flex items-center gap-2">
          <span>{t('shortcuts')}</span>
          <kbd className={`px-2 py-1 border rounded-lg font-mono font-bold ${
            isDark ? 'bg-[#131B2E] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}>1</kbd>
          <span>или</span>
          <kbd className={`px-2 py-1 border rounded-lg font-mono font-bold ${
            isDark ? 'bg-[#131B2E] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}>2</kbd>
        </div>

        <button
          onClick={loadNextPair}
          disabled={selectedWinnerId !== null}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            isDark
              ? 'bg-[#131B2E] hover:bg-[#1A243D] border-slate-800 text-slate-400 hover:text-white'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('skipPair')}</span>
        </button>
      </div>

    </div>
  );
};

interface DuelCardProps {
  problem: Problem;
  shortcut: string;
  isWinner: boolean;
  isLoser: boolean;
  disabled: boolean;
  isGuest: boolean;
  isDark: boolean;
  language: Language;
  t: (k: string) => string;
  onSelect: () => void;
}

const DuelCard: React.FC<DuelCardProps> = ({
  problem,
  shortcut,
  isWinner,
  isLoser,
  disabled,
  isGuest,
  isDark,
  language,
  t,
  onSelect,
}) => {
  const districtName = getDistrictLabel(problem.district, language);
  const categoryName = getCategoryLabel(problem.category, language);
  const priority = getPriorityFromElo(problem.eloRating, language);

  return (
    <motion.div
      onClick={!disabled ? onSelect : undefined}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{
        opacity: isLoser ? 0.25 : 1,
        scale: isWinner ? 1.02 : isLoser ? 0.98 : 1,
        filter: isLoser ? 'grayscale(80%)' : 'grayscale(0%)',
      }}
      whileHover={!disabled ? { y: -4, scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative h-[440px] sm:h-[490px] w-full rounded-3xl overflow-hidden cursor-pointer border-2 transition-all duration-300 flex flex-col justify-between p-6 select-none shadow-2xl bg-slate-900 ${
        isWinner
          ? 'border-emerald-500 shadow-[0_0_45px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500'
          : isLoser
          ? isDark ? 'border-slate-800' : 'border-slate-300'
          : isDark
          ? 'border-slate-800 hover:border-slate-600 bg-[#131B2E]'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
    >
      {/* Background Image with Fallback */}
      <img
        src={problem.imageUrl}
        alt={problem.title}
        onError={(e) => handleImageError(e, problem.category)}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* High-Contrast Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/25" />

      {/* Top Badges */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-white">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>{districtName}</span>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-semibold border border-rose-500/30 text-rose-300 bg-slate-950/80">
            {categoryName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Human-friendly priority badge (Elo calculated under the hood) */}
          <div className={`px-3 py-1 rounded-full border text-xs font-bold backdrop-blur-md bg-slate-950/85 ${priority.badgeClass}`}>
            {priority.label}
          </div>

          <span className="hidden md:flex w-7 h-7 rounded-full bg-slate-950/90 border border-slate-700 items-center justify-center text-xs font-mono font-bold text-slate-300 group-hover:border-rose-500 group-hover:text-rose-400 transition-colors">
            {shortcut}
          </span>
        </div>
      </div>

      {/* Winner Toast */}
      {isWinner && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-lg shadow-2xl flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{t('priorityBoosted')}</span>
        </motion.div>
      )}

      {/* Bottom Content */}
      <div className="relative z-10 space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug group-hover:text-rose-200 transition-colors line-clamp-2 drop-shadow-md">
          {problem.title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed drop-shadow-sm">
          {problem.description}
        </p>

        {problem.address && (
          <p className="text-xs text-slate-300 flex items-center gap-1 font-medium">
            <span>📍 {problem.address}</span>
          </p>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            disabled={disabled}
            className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
              isWinner
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                : isGuest
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold shadow-lg cursor-pointer'
                : 'bg-white text-slate-950 hover:bg-rose-500 hover:text-white font-bold backdrop-blur-md shadow-lg cursor-pointer'
            }`}
          >
            {isWinner ? (
              <>{t('priorityChosen')}</>
            ) : isGuest ? (
              <>
                <Lock className="w-4 h-4" />
                {t('loginToVote')}
              </>
            ) : (
              <>
                {t('choosePriority')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
