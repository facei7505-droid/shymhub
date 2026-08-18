import React from 'react';
import { BarChart3, TrendingUp, AlertOctagon, CheckCircle, Users, Flame } from 'lucide-react';
import type { Problem, MatchHistory, ThemeMode, Language, District, Category } from '../types';
import { TRANSLATIONS, getDistrictLabel, getCategoryLabel } from '../i18n/translations';

interface StatsDashboardProps {
  problems: Problem[];
  matchHistory?: MatchHistory[];
  theme?: ThemeMode;
  language?: Language;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  problems,
  theme = 'dark',
  language = 'ru',
}) => {
  const totalVotes = problems.reduce((acc, p) => acc + p.matchesPlayed, 0) / 2;
  const criticalCount = problems.filter((p) => p.eloRating >= 1350).length;
  const resolvedCount = problems.filter((p) => p.status === 'resolved').length;

  const isDark = theme === 'dark';
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;

  const districtStats = problems.reduce((acc, p) => {
    if (!acc[p.district]) {
      acc[p.district] = { count: 0, avgElo: 0, totalElo: 0 };
    }
    acc[p.district].count += 1;
    acc[p.district].totalElo += p.eloRating;
    acc[p.district].avgElo = Math.round(acc[p.district].totalElo / acc[p.district].count);
    return acc;
  }, {} as Record<string, { count: number; avgElo: number; totalElo: number }>);

  const categoryStats = problems.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className={`border-b pb-6 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          {t('statsBadge')}
        </div>
        <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('statsTitle')}
        </h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {t('statsSubtitle')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-5 rounded-3xl space-y-2 border transition-all ${
          isDark ? 'bg-[#131B2E]/90 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('kpiDuels')}</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-3xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Math.round(totalVotes)}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3" /> {t('kpiFair')}
          </p>
        </div>

        <div className={`p-5 rounded-3xl space-y-2 border transition-all ${
          isDark ? 'bg-[#131B2E]/90 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('kpiCritical')}</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono">
            {criticalCount}
          </div>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('kpiCriticalDesc')}
          </p>
        </div>

        <div className={`p-5 rounded-3xl space-y-2 border transition-all ${
          isDark ? 'bg-[#131B2E]/90 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('kpiTotal')}</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono">
            {problems.length}
          </div>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('kpiTotalDesc')}
          </p>
        </div>

        <div className={`p-5 rounded-3xl space-y-2 border transition-all ${
          isDark ? 'bg-[#131B2E]/90 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('kpiResolved')}</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {resolvedCount}
          </div>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('kpiResolvedDesc')}
          </p>
        </div>

      </div>

      {/* District Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* District Chart Card */}
        <div className={`rounded-3xl p-6 space-y-4 border ${
          isDark ? 'bg-[#131B2E]/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('districtTension')}
          </h3>
          <div className="space-y-3">
            {Object.entries(districtStats).map(([name, data]) => {
              const percentage = Math.min(100, Math.max(0, ((data.avgElo - 1000) / 600) * 100));
              const localizedDistrict = getDistrictLabel(name as District, language);
              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700 font-semibold'}>
                      {localizedDistrict} ({data.count} {t('reportsCount')})
                    </span>
                    <span className="font-mono font-bold text-rose-400">{data.avgElo} Elo</span>
                  </div>
                  <div className={`h-2.5 w-full rounded-full overflow-hidden border ${
                    isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div className={`rounded-3xl p-6 space-y-4 border ${
          isDark ? 'bg-[#131B2E]/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('categoryDistribution')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(categoryStats).map(([category, count]) => {
              const localizedCategory = getCategoryLabel(category as Category, language);
              return (
                <div
                  key={category}
                  className={`p-3.5 rounded-2xl border space-y-1 ${
                    isDark ? 'bg-[#0B0F19]/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                    {localizedCategory}
                  </div>
                  <div className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {count} {t('reportsCount')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
