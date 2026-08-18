import type { Problem, MatchHistory } from '../types';
import { calculateElo } from './elo';
import { CATEGORY_FALLBACK_IMAGES } from './images';

const STORAGE_KEY = 'urban_arena_problems_fastapi_v1';
const HISTORY_KEY = 'urban_arena_matches_v1';

export function getProblems(): Problem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed: Problem[] = JSON.parse(data);
    return parsed.map((p) => {
      if (!p.imageUrl || p.imageUrl.trim() === '') {
        p.imageUrl = CATEGORY_FALLBACK_IMAGES[p.category] || CATEGORY_FALLBACK_IMAGES.roads;
      }
      return p;
    });
  } catch (e) {
    console.error('Failed to load problems from storage', e);
    return [];
  }
}

export function saveProblems(problems: Problem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  } catch (e) {
    console.error('Failed to save problems', e);
  }
}

export function resetProblems(): Problem[] {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HISTORY_KEY);
  return [];
}

export function getMatchHistory(): MatchHistory[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function updateProblemStatus(problemId: string, status: Problem['status']): Problem[] {
  const problems = getProblems();
  const problem = problems.find((p) => p.id === problemId);
  if (problem) {
    problem.status = status;
    saveProblems(problems);
  }
  return [...problems];
}

export function updateProblemResolution(
  problemId: string,
  resolvedImageUrl?: string,
  resolvedNote?: string
): Problem[] {
  const problems = getProblems();
  const problem = problems.find((p) => p.id === problemId);
  if (problem) {
    problem.status = 'resolved';
    problem.resolvedAt = new Date().toISOString();
    if (resolvedImageUrl) problem.resolvedImageUrl = resolvedImageUrl;
    if (resolvedNote) problem.resolvedNote = resolvedNote;
    saveProblems(problems);
  }
  return [...problems];
}

export function deleteProblem(problemId: string): Problem[] {
  const problems = getProblems().filter((p) => p.id !== problemId);
  saveProblems(problems);
  return [...problems];
}

export function recordVote(winnerId: string, loserId: string, userId?: string): { updatedProblems: Problem[]; delta: number } {
  const problems = getProblems();
  const winner = problems.find((p) => p.id === winnerId);
  const loser = problems.find((p) => p.id === loserId);

  if (!winner || !loser) {
    return { updatedProblems: problems, delta: 0 };
  }

  const { newWinnerRating, newLoserRating, winnerDelta, loserDelta } = calculateElo(
    winner.eloRating,
    winner.matchesPlayed,
    loser.eloRating,
    loser.matchesPlayed
  );

  winner.eloRating = newWinnerRating;
  winner.matchesPlayed += 1;
  winner.winsCount += 1;

  loser.eloRating = newLoserRating;
  loser.matchesPlayed += 1;

  saveProblems(problems);

  // Save history
  const history = getMatchHistory();
  history.unshift({
    id: `match-${Date.now()}`,
    winnerId,
    loserId,
    winnerRatingDelta: winnerDelta,
    loserRatingDelta: loserDelta,
    timestamp: new Date().toISOString(),
    userId,
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));

  return { updatedProblems: [...problems], delta: winnerDelta };
}

export function getPairToVote(excludeIds: string[] = []): [Problem, Problem] | null {
  const problems = getProblems().filter((p) => p.status !== 'resolved');
  if (problems.length < 2) return null;

  const pool = problems.filter((p) => !excludeIds.includes(p.id));
  const candidatePool = pool.length >= 2 ? pool : problems;

  const firstIndex = Math.floor(Math.random() * candidatePool.length);
  const first = candidatePool[firstIndex];

  const remaining = problems.filter((p) => p.id !== first.id);
  const closeEloCandidates = remaining.filter((p) => Math.abs(p.eloRating - first.eloRating) <= 200);

  let second: Problem;
  if (closeEloCandidates.length > 0) {
    const secondIndex = Math.floor(Math.random() * closeEloCandidates.length);
    second = closeEloCandidates[secondIndex];
  } else {
    const secondIndex = Math.floor(Math.random() * remaining.length);
    second = remaining[secondIndex];
  }

  return [first, second];
}

export function addNewProblem(problem: Omit<Problem, 'id' | 'eloRating' | 'matchesPlayed' | 'winsCount' | 'createdAt'>): Problem {
  const problems = getProblems();
  const newProblem: Problem = {
    ...problem,
    id: `custom-${Date.now()}`,
    eloRating: 1200,
    matchesPlayed: 0,
    winsCount: 0,
    createdAt: new Date().toISOString(),
  };

  problems.unshift(newProblem);
  saveProblems(problems);
  return newProblem;
}
