import React from 'react';
import { Plus, User as UserIcon, Sun, Moon, Settings, MapPin, Shield } from 'lucide-react';
import type { User, ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

export type TabType = 'arena' | 'map' | 'inspector';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAddModal: () => void;
  onResetData?: () => void;
  currentUser: User | null;
  theme: ThemeMode;
  onToggleTheme: () => void;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  currentUser,
  theme,
  onToggleTheme,
  language,
  onChangeLanguage,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenSettingsModal,
}) => {
  const isDark = theme === 'dark';
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;
  const isInspector = currentUser?.role === 'inspector';

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-300 ${
      isDark
        ? 'border-slate-800/80 bg-[#0B0F19]/90 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
        : 'border-slate-200 bg-white/95 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none group"
          onClick={() => setActiveTab('arena')}
        >
          <img
            src="/logo.jpg"
            alt="UrbanArena Logo"
            className="w-10 h-10 rounded-xl object-contain"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`font-black text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                UrbanArena
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                isDark ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
              }`}>
                SHYMKENT
              </span>
            </div>
            <span className={`text-[11px] font-medium tracking-tight hidden sm:block ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {t('tagline')}
            </span>
          </div>
        </div>

        {/* Tab Navigation (Arena, Map, Inspector) */}
        <nav className={`flex items-center p-1 rounded-2xl border transition-all ${
          isDark ? 'bg-[#131B2E] border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('arena')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'arena'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-[#1A243D]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span>⚔️</span>
            <span>{t('arena')}</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-[#1A243D]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('map')}</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inspector'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30'
                : isInspector
                ? 'text-amber-400 hover:bg-amber-500/10'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-[#1A243D]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
            title="Кабинет Акимата и ЖКХ"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Акимат</span>
          </button>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          
          {/* Language Switcher */}
          <div className={`hidden sm:flex items-center p-0.5 rounded-xl border text-xs font-bold ${
            isDark ? 'bg-[#131B2E] border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {(['kz', 'ru', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => onChangeLanguage(l)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer uppercase ${
                  language === l
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Add Problem Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t('reportProblem')}</span>
          </button>

          {/* Clean User Profile Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfileModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border cursor-pointer transition-all ${
                isDark ? 'bg-[#131B2E] border-slate-800 hover:bg-[#1A243D] text-slate-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900 shadow-sm'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                currentUser.role === 'inspector'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              }`}>
                {currentUser.role === 'inspector' ? <Shield className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-bold hidden sm:inline">
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isDark ? 'bg-[#131B2E] text-slate-200 border-slate-800 hover:bg-[#1A243D]' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-cyan-500" />
              <span>{t('login')}</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark ? 'bg-[#131B2E] text-amber-400 border-slate-800 hover:bg-[#1A243D]' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Сменить тему"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettingsModal}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark ? 'bg-[#131B2E] text-slate-400 hover:text-white border-slate-800 hover:bg-[#1A243D]' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Настройки"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
