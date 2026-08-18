import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  ExternalLink,
  MapPin,
  X,
  Filter
} from 'lucide-react';
import type { Problem, District, Category, ThemeMode, Language } from '../types';
import { updateProblemStatus, updateProblemResolution, deleteProblem } from '../utils/storage';
import { getDistrictLabel, getCategoryLabel } from '../i18n/translations';
import { getPriorityFromElo } from '../utils/priority';
import { handleImageError } from '../utils/images';
import { exportProblemsToCSV } from '../utils/export';

interface InspectorDashboardProps {
  problems: Problem[];
  onDataMutated: () => void;
  theme?: ThemeMode;
  language?: Language;
}

export const InspectorDashboard: React.FC<InspectorDashboardProps> = ({
  problems,
  onDataMutated,
  theme = 'dark',
  language = 'ru',
}) => {
  const isDark = theme === 'dark';

  const [selectedDistrict, setSelectedDistrict] = useState<'all' | District>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Category>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Problem['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Resolve modal state
  const [resolvingProblem, setResolvingProblem] = useState<Problem | null>(null);
  const [resolvedImage, setResolvedImage] = useState('');
  const [resolvedNote, setResolvedNote] = useState('');

  const districts: District[] = ['Аль-Фарабийский', 'Енбекшинский', 'Абайский', 'Каратауский', 'Туран'];

  // Filter and sort by priority (Elo)
  const filteredProblems = useMemo(() => {
    return problems
      .filter((p) => {
        if (selectedDistrict !== 'all' && p.district !== selectedDistrict) return false;
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchAddr = (p.address || '').toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchTitle && !matchAddr && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // High priority first, open before resolved
        if (a.status === 'open' && b.status === 'resolved') return -1;
        if (a.status === 'resolved' && b.status === 'open') return 1;
        return b.eloRating - a.eloRating;
      });
  }, [problems, selectedDistrict, selectedCategory, selectedStatus, searchQuery]);

  // Statistics KPIs
  const stats = useMemo(() => {
    const total = problems.length;
    const critical = problems.filter((p) => p.eloRating >= 1380 && p.status !== 'resolved').length;
    const inProgress = problems.filter((p) => p.status === 'in_progress').length;
    const resolved = problems.filter((p) => p.status === 'resolved').length;
    return { total, critical, inProgress, resolved };
  }, [problems]);

  const handleStatusChange = (id: string, status: Problem['status']) => {
    updateProblemStatus(id, status);
    onDataMutated();
  };

  const handleOpenResolveModal = (problem: Problem) => {
    setResolvingProblem(problem);
    setResolvedImage(problem.resolvedImageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800&auto=format&fit=crop&q=80');
    setResolvedNote(problem.resolvedNote || 'Работы завершены коммунальной службой района.');
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingProblem) return;
    updateProblemResolution(resolvingProblem.id, resolvedImage, resolvedNote);
    onDataMutated();
    setResolvingProblem(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Удалить эту заявку из системы?')) {
      deleteProblem(id);
      onDataMutated();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Style Tokens ──────────────────────────────────────────────────────────
  const cardBg     = isDark ? 'bg-[#131B2E] border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const subText    = isDark ? 'text-slate-400' : 'text-slate-500';
  const headText   = isDark ? 'text-white' : 'text-slate-900';
  const tableHead  = isDark ? 'bg-[#0B0F19] text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200';
  const rowHover   = isDark ? 'hover:bg-slate-800/40 border-slate-800/80' : 'hover:bg-slate-50/80 border-slate-200';
  const inputBg    = isDark
    ? 'bg-[#0B0F19] border-slate-800 text-white placeholder:text-slate-500 focus:border-cyan-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500';

  return (
    <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg} relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${headText}`}>
                  Штаб ЖКХ & Акимат Шымкента
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
                  Dispatcher Mode
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-1 ${subText}`}>
                Приоритетные наряды на выезд ремонтных бригад на основе объективных оценок жителей
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportProblemsToCSV(filteredProblems)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Экспорт в Excel (CSV)</span>
            </button>

            <button
              onClick={handlePrint}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Печать наряда</span>
            </button>
          </div>

        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className={`p-4 sm:p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${subText}`}>Всего заявок</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black mt-2 ${headText}`}>{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">В базе Шымкента</div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Критические (#1)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-rose-500">{stats.critical}</div>
          <div className="text-[11px] text-rose-400 mt-0.5">Требуют срочного выезда</div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">В работе бригад</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-amber-500">{stats.inProgress}</div>
          <div className="text-[11px] text-amber-400 mt-0.5">Ремонт выполняется</div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Устранено</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-emerald-500">{stats.resolved}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Есть фото-отчет «До/После»</div>
        </div>

      </div>

      {/* Control Bar & Filters */}
      <div className={`p-4 rounded-2xl border ${cardBg} space-y-3`}>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию проблемы или точному адресу в Шымкенте..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${inputBg}`}
            />
          </div>

          {/* District Select */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value as 'all' | District)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${inputBg}`}
            >
              <option value="all">🌍 Все 5 районов</option>
              {districts.map((d) => (
                <option key={d} value={d}>📍 {getDistrictLabel(d, language)}</option>
              ))}
            </select>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'all' | Category)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${inputBg}`}
            >
              <option value="all">📂 Все категории</option>
              <option value="roads">🚗 Дороги / Люки</option>
              <option value="lighting">💡 Освещение</option>
              <option value="garbage">🗑️ Мусор / Свалки</option>
              <option value="utilities">💧 ЖКХ / Вода</option>
              <option value="ecology">🌳 Экология</option>
              <option value="infrastructure">🏢 Инфраструктура</option>
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | Problem['status'])}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${inputBg}`}
            >
              <option value="all">📌 Все статусы</option>
              <option value="open">⏳ В очереди</option>
              <option value="in_progress">🚜 В работе</option>
              <option value="resolved">✅ Устранено</option>
            </select>
          </div>

        </div>

        {/* District Quick Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className={`text-[11px] font-bold shrink-0 mr-1 flex items-center gap-1 ${subText}`}>
            <Filter className="w-3 h-3" /> Районы:
          </span>
          <button
            onClick={() => setSelectedDistrict('all')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
              selectedDistrict === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : isDark ? 'bg-[#0B0F19] text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Все ({problems.length})
          </button>
          {districts.map((d) => {
            const count = problems.filter((p) => p.district === d).length;
            return (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedDistrict === d
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : isDark ? 'bg-[#0B0F19] text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {getDistrictLabel(d, language)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table / Dispatch List */}
      <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-bold uppercase tracking-wider ${tableHead}`}>
                <th className="py-3.5 px-4"># / Приоритет</th>
                <th className="py-3.5 px-4">Объект & Фото</th>
                <th className="py-3.5 px-4">Локация & Район</th>
                <th className="py-3.5 px-4">Статус</th>
                <th className="py-3.5 px-4 text-right">Действия диспетчера</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`py-12 text-center text-sm ${subText}`}>
                    По заданным фильтрам объектов не найдено.
                  </td>
                </tr>
              ) : (
                filteredProblems.map((problem, index) => {
                  const priority = getPriorityFromElo(problem.eloRating, language);
                  const isResolved = problem.status === 'resolved';
                  const isInProgress = problem.status === 'in_progress';

                  return (
                    <tr key={problem.id} className={`transition-colors ${rowHover}`}>
                      
                      {/* # / Priority */}
                      <td className="py-4 px-4 align-middle">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-slate-400">
                            #{index + 1}
                          </span>
                          <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold inline-block ${priority.badgeClass}`}>
                            {priority.label}
                          </div>
                        </div>
                      </td>

                      {/* Title & Photo */}
                      <td className="py-4 px-4 align-middle max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                            <img
                              src={problem.imageUrl}
                              alt={problem.title}
                              onError={(e) => handleImageError(e, problem.category)}
                              className="w-full h-full object-cover"
                            />
                            {isResolved && (
                              <div className="absolute inset-0 bg-emerald-500/40 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`font-bold text-sm truncate ${headText}`}>
                              {problem.title}
                            </div>
                            <p className={`text-[11px] line-clamp-1 mt-0.5 ${subText}`}>
                              {problem.description}
                            </p>
                            <span className="text-[10px] text-cyan-500 font-semibold">
                              {getCategoryLabel(problem.category, language)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* District & Location */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-bold text-slate-200">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{getDistrictLabel(problem.district, language)}</span>
                          </div>
                          {problem.address && (
                            <div className={`text-[11px] truncate max-w-[200px] ${subText}`}>
                              {problem.address}
                            </div>
                          )}
                          <a
                            href={`https://maps.google.com/?q=${problem.locationLat},${problem.locationLng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <span>На карте</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Устранено
                          </span>
                        ) : isInProgress ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold">
                            <Wrench className="w-3.5 h-3.5 animate-spin" />
                            В работе
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            В очереди
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Take to Work Button */}
                          {!isResolved && !isInProgress && (
                            <button
                              onClick={() => handleStatusChange(problem.id, 'in_progress')}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="Отправить ремонтную бригаду"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>В работу</span>
                            </button>
                          )}

                          {/* Resolve Button */}
                          {!isResolved && (
                            <button
                              onClick={() => handleOpenResolveModal(problem)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="Прикрепить отчет о выполненных работах"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Решено</span>
                            </button>
                          )}

                          {/* Reopen Button if resolved */}
                          {isResolved && (
                            <button
                              onClick={() => handleStatusChange(problem.id, 'open')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                isDark
                                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                              }`}
                              title="Вернуть в очередь"
                            >
                              Вернуть в очередь
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(problem.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Удалить заявку"
                          >
                            <X className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Problem Modal */}
      {resolvingProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`relative w-full max-w-lg ${cardBg} rounded-3xl p-6 shadow-2xl border space-y-4`}>
            
            <button
              onClick={() => setResolvingProblem(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${headText}`}>
                  Отчет о выполнении работ
                </h3>
                <p className={`text-xs ${subText}`}>
                  {resolvingProblem.title}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-4 pt-2">
              
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${headText}`}>
                  Фотография после ремонта (URL) *
                </label>
                <input
                  type="url"
                  required
                  value={resolvedImage}
                  onChange={(e) => setResolvedImage(e.target.value)}
                  placeholder="https://..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                />
              </div>

              {resolvedImage && (
                <div className="relative h-36 rounded-xl overflow-hidden border border-slate-700">
                  <img
                    src={resolvedImage}
                    alt="Resolved Proof"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                    Фото «После»
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${headText}`}>
                  Отчетная заметка для жителей и руководства
                </label>
                <textarea
                  rows={2}
                  value={resolvedNote}
                  onChange={(e) => setResolvedNote(e.target.value)}
                  placeholder="Например: Уложена новая асфальтобетонная смесь, работы приняты технадзором."
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none resize-none ${inputBg}`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingProblem(null)}
                  className={`w-1/3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow cursor-pointer"
                >
                  Подтвердить устранение
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
