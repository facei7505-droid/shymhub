import type { Problem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = {
  // Get all problems from FastAPI
  async getProblems(): Promise<Problem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/problems`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('FastAPI backend not reachable, falling back to local state:', err);
      return [];
    }
  },

  // Create a new problem
  async createProblem(problem: Partial<Problem>): Promise<Problem | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problem),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to create problem on FastAPI backend:', err);
      return null;
    }
  },

  // Record a duel vote
  async recordVote(winnerId: string, loserId: string, userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_id: winnerId, loser_id: loserId, user_id: userId }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to record vote on FastAPI backend:', err);
      return null;
    }
  },

  // Update problem status
  async updateStatus(problemId: string, status: Problem['status']) {
    try {
      const res = await fetch(`${API_BASE_URL}/problems/${problemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to update status on FastAPI backend:', err);
      return null;
    }
  },

  // Resolve problem with after photo and note
  async resolveProblem(problemId: string, resolvedImageUrl: string, resolvedNote?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/problems/${problemId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolved_image_url: resolvedImageUrl,
          resolved_note: resolvedNote,
        }),
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to resolve problem on FastAPI backend:', err);
      return null;
    }
  },

  // Delete problem
  async deleteProblem(problemId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete problem on FastAPI backend:', err);
      return false;
    }
  },
};
