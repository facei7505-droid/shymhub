export type District = 'Аль-Фарабийский' | 'Енбекшинский' | 'Абайский' | 'Каратауский' | 'Туран';

export type Category = 'roads' | 'lighting' | 'garbage' | 'utilities' | 'ecology' | 'infrastructure';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type UserRole = 'citizen' | 'inspector';

export type ThemeMode = 'dark' | 'light';

export type Language = 'kz' | 'ru' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  votesCount: number;
  problemsReportedCount: number;
  district?: District;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  district: District;
  category: Category;
  imageUrl: string;
  resolvedImageUrl?: string;
  resolvedAt?: string;
  resolvedNote?: string;
  eloRating: number;
  matchesPlayed: number;
  winsCount: number;
  locationLat: number;
  locationLng: number;
  address?: string;
  status: 'open' | 'in_progress' | 'resolved';
  urgencyLevel?: UrgencyLevel;
  createdAt: string;
  authorId?: string;
  authorName?: string;
}

export interface MatchHistory {
  id: string;
  winnerId: string;
  loserId: string;
  winnerRatingDelta: number;
  loserRatingDelta: number;
  timestamp: string;
  userId?: string;
}

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  matchmakingEloDelta: number;
  kFactorNew: number;
  kFactorStandard: number;
  arenaDistrictFilter: 'all' | District;
  arenaCategoryFilter: 'all' | Category;
  autoSkipDelayMs: number;
  keyboardShortcutsEnabled: boolean;
}
