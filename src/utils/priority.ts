import type { Language } from '../types';

export interface PriorityInfo {
  label: string;
  badgeClass: string;
  dotColor: string;
  shortLabel: string;
}

export function getPriorityFromElo(elo: number, lang: Language = 'ru'): PriorityInfo {
  if (elo >= 1380) {
    return {
      label: lang === 'kz' ? '🚨 Өте шұғыл' : lang === 'en' ? '🚨 Critical Priority' : '🚨 Критический приоритет',
      shortLabel: lang === 'kz' ? 'Өте шұғыл' : lang === 'en' ? 'Critical' : 'Критический',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dotColor: '#e11d48',
    };
  }
  if (elo >= 1230) {
    return {
      label: lang === 'kz' ? '🔥 Жоғары басымдық' : lang === 'en' ? '🔥 High Priority' : '🔥 Высокий приоритет',
      shortLabel: lang === 'kz' ? 'Жоғары' : lang === 'en' ? 'High' : 'Высокий',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dotColor: '#f59e0b',
    };
  }
  return {
    label: lang === 'kz' ? '⚡ Тұрғындар бақылауында' : lang === 'en' ? '⚡ Under Review' : '⚡ На рассмотрении',
    shortLabel: lang === 'kz' ? 'Бақылауда' : lang === 'en' ? 'In Review' : 'В очереди',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dotColor: '#06b6d4',
  };
}
