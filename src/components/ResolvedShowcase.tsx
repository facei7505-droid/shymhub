import React, { useState } from 'react';
import { CheckCircle2, MapPin, Sparkles, Trophy, Calendar, FileCheck, ShieldCheck } from 'lucide-react';
import type { Problem, District, Category, ThemeMode, Language } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { TRANSLATIONS, getDistrictLabel, getCategoryLabel } from '../i18n/translations';

interface ResolvedShowcaseProps {
  problems: Problem[];
  theme?: ThemeMode;
  language?: Language;
}

export const ResolvedShowcase: React.FC<ResolvedShowcaseProps> = ({
  problems,
  theme = 'light',
  language = 'ru',
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isDark = theme === 'dark';
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;

  const districts: District[] = ['Аль-Фарабийский', 'Енбекшинский', 'Абайский', 'Каратауский', 'Туран'];
  const categories: Category[] = ['roads', 'lighting', 'garbage', 'utilities', 'ecology', 'infrastructure'];

  // Filter problems that are resolved and have a resolved image
  const resolvedProblems = problems.filter((p) => {
    const isResolved = p.status === 'resolved' || Boolean(p.resolvedImageUrl);
    const matchDistrict = selectedDistrict === 'all' || p.district === selectedDistrict;
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return isResolved && matchDistrict && matchCategory;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {t('resolvedBadge')}
          </div>
          <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('resolvedTitle')}
          </h2>
          <p className={`text-sm mt-1 max-w-3xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('resolvedSubtitle')}
          </p>
        </div>

        {/* Total resolved badge */}
        <div className={`flex items-center gap-3 p-3.5 rounded-2xl border shrink-0 ${
          isDark ? 'bg-[#131B2E]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-xl font-black font-mono leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {resolvedProblems.length}
            </div>
            <div className="text-[11px] text-emerald-500 font-bold mt-0.5">
              Объектов восстановлено
            </div>
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
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
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
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
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

      {/* Grid of Resolved Problems with Interactive Slider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {resolvedProblems.map((problem) => {
          const districtName = getDistrictLabel(problem.district, language);
          const categoryName = getCategoryLabel(problem.category, language);
          const afterPhoto = problem.resolvedImageUrl || problem.imageUrl;

          return (
            <div
              key={problem.id}
              className={`rounded-3xl border overflow-hidden p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                isDark
                  ? 'bg-[#131B2E]/90 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 shadow-md'
              }`}
            >
              {/* Interactive Before/After Image Slider */}
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden shadow-inner">
                <BeforeAfterSlider
                  beforeImage={problem.imageUrl}
                  afterImage={afterPhoto}
                  language={language}
                  className="w-full h-full"
                />
              </div>

              {/* Problem Info */}
              <div className="space-y-2.5 flex-1">
                
                {/* Badges bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      isDark ? 'bg-slate-800/80 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{districtName}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {categoryName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Trophy className="w-3 h-3" />
                    <span>{problem.eloRating} Elo</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className={`text-lg font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {problem.title}
                </h3>

                {/* Description */}
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {problem.description}
                </p>

                {/* Official Akimat Resolution Report Box */}
                {problem.resolvedNote && (
                  <div className={`p-3 rounded-2xl border space-y-1 ${
                    isDark ? 'bg-[#0B0F19]/80 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-200'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{t('akimatReport')}</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {problem.resolvedNote}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Meta & Community Impact */}
              <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <div className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{problem.winsCount} {t('votesContributed')}</span>
                </div>

                {problem.resolvedAt && (
                  <div className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(problem.resolvedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {resolvedProblems.length === 0 && (
        <div className={`text-center py-16 rounded-3xl border ${
          isDark ? 'bg-[#131B2E]/50 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          {t('noResolvedYet')}
        </div>
      )}

    </div>
  );
};
