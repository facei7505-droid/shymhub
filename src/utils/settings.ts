import type { AppSettings, Problem } from '../types';
import { getProblems, recordVote } from './storage';

const SETTINGS_STORAGE_KEY = 'urban_arena_app_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'ru',
  theme: 'light',
  soundEnabled: true,
  confettiEnabled: true,
  matchmakingEloDelta: 200,
  kFactorNew: 40,
  kFactorStandard: 20,
  arenaDistrictFilter: 'all',
  arenaCategoryFilter: 'all',
  autoSkipDelayMs: 550,
  keyboardShortcutsEnabled: true,
};

export function getAppSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save app settings', e);
  }
}

export function simulateCrowdVotes(count: number = 30): Problem[] {
  const problems = getProblems();
  if (problems.length < 2) return problems;

  for (let i = 0; i < count; i++) {
    const idxA = Math.floor(Math.random() * problems.length);
    let idxB = Math.floor(Math.random() * problems.length);
    while (idxB === idxA) {
      idxB = Math.floor(Math.random() * problems.length);
    }

    const probA = problems[idxA];
    const probB = problems[idxB];

    const weightA = probA.category === 'roads' || probA.title.toLowerCase().includes('люк') ? 1.4 : 1.0;
    const weightB = probB.category === 'roads' || probB.title.toLowerCase().includes('люк') ? 1.4 : 1.0;

    const probAWins = Math.random() * weightA > Math.random() * weightB;
    const winnerId = probAWins ? probA.id : probB.id;
    const loserId = probAWins ? probB.id : probA.id;

    recordVote(winnerId, loserId, `simulated-bot-${i}`);
  }

  return getProblems();
}
