import type { Problem, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getToken = (): string | null => {
  return localStorage.getItem('shymkent_hub_token');
};

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiClient = {
  async getProblems(): Promise<Problem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/problems`, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('FastAPI backend not reachable, falling back to local state:', err);
      return [];
    }
  },

  async createProblem(problem: Partial<Problem>): Promise<Problem | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(problem),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to create problem on FastAPI backend:', err);
      return null;
    }
  },

  async recordVote(winnerId: string, loserId: string, userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ winner_id: winnerId, loser_id: loserId, user_id: userId }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to record vote on FastAPI backend:', err);
      return null;
    }
  },

  async updateStatus(problemId: string, status: Problem['status']) {
    try {
      const res = await fetch(`${API_BASE_URL}/problems/${problemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ status }),
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to update status on FastAPI backend:', err);
      return null;
    }
  },

  async resolveProblem(problemId: string, resolvedImageUrl: string, resolvedNote?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/problems/${problemId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
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

  async deleteProblem(problemId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete problem on FastAPI backend:', err);
      return false;
    }
  },

  async register(name: string, email: string, password: string, role: string = 'citizen', district?: string) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, district }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return await res.json() as { access_token: string; token_type: string; user: User };
  },

  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return await res.json() as { access_token: string; token_type: string; user: User };
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) return null;
      return await res.json() as User;
    } catch {
      return null;
    }
  },

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('shymkent_hub_token', token);
    } else {
      localStorage.removeItem('shymkent_hub_token');
    }
  },

  getToken,
};
