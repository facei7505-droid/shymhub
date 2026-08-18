import type { User, District } from '../types';
import { apiClient } from './api';

const USER_STORAGE_KEY = 'urban_arena_current_user_v2';

export const DEMO_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Айдар Касымов',
    email: 'aidar@shymkent.kz',
    role: 'citizen',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    votesCount: 42,
    problemsReportedCount: 3,
    district: 'Аль-Фарабийский',
  },
  {
    id: 'user-2',
    name: 'Инспектор ЖКХ (Акимат)',
    email: 'inspector@shymkent.gov.kz',
    role: 'inspector',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    votesCount: 156,
    problemsReportedCount: 12,
    district: 'Аль-Фарабийский',
  },
];

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : DEMO_USERS[0];
  } catch {
    return DEMO_USERS[0];
  }
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to set current user', e);
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  const user = await apiClient.getCurrentUser();
  if (user) {
    setCurrentUser(user);
  }
  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const result = await apiClient.login(email, password);
  apiClient.setToken(result.access_token);
  setCurrentUser(result.user);
  return result.user;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: string = 'citizen',
  district?: District
): Promise<User> {
  const result = await apiClient.register(name, email, password, role, district);
  apiClient.setToken(result.access_token);
  setCurrentUser(result.user);
  return result.user;
}

export function registerCustomUser(name: string, district?: District): User {
  const newUser: User = {
    id: `citizen-${Date.now()}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '')}@citizen.kz`,
    role: 'citizen',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    votesCount: 0,
    problemsReportedCount: 0,
    district: district || 'Аль-Фарабийский',
  };

  setCurrentUser(newUser);
  return newUser;
}

export function incrementUserVote(): User | null {
  const current = getCurrentUser();
  if (!current) return null;
  current.votesCount += 1;
  setCurrentUser(current);
  return current;
}

export function incrementUserProblem(): User | null {
  const current = getCurrentUser();
  if (!current) return null;
  current.problemsReportedCount += 1;
  setCurrentUser(current);
  return current;
}

export function logoutUser(): void {
  apiClient.setToken(null);
  setCurrentUser(null);
}
