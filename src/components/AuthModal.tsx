import React, { useState } from 'react';
import { X, User as UserIcon, Shield, ArrowRight } from 'lucide-react';
import type { User, District, Language, ThemeMode } from '../types';
import { DEMO_USERS, registerCustomUser } from '../utils/auth';
import { TRANSLATIONS, getDistrictLabel } from '../i18n/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  language?: Language;
  theme?: ThemeMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language = 'ru',
  theme = 'dark',
}) => {
  const [tab, setTab] = useState<'demo' | 'custom'>('demo');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState<District>('Аль-Фарабийский');

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;

  const handleSelectDemo = (user: User) => {
    onLoginSuccess(user);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const user = registerCustomUser(name, district);
    onLoginSuccess(user);
    onClose();
  };

  const districts: District[] = ['Аль-Фарабийский', 'Енбекшинский', 'Абайский', 'Каратауский', 'Туран'];

  // ── Style tokens ──────────────────────────────────────────────────────────
  const bg      = isDark ? 'bg-[#131B2E]' : 'bg-white';
  const border  = isDark ? 'border-slate-700' : 'border-slate-200';
  const overlay = isDark ? 'bg-black/60' : 'bg-slate-900/40';
  const titleCls = isDark ? 'text-white' : 'text-slate-900';
  const subCls   = isDark ? 'text-slate-400' : 'text-slate-500';
  const closeBtnCls = isDark
    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100';
  const tabBarBg = isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-100 border-slate-200';
  const tabActive = 'bg-cyan-500 text-slate-950 font-bold shadow';
  const tabIdle   = isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900';
  const demoCardBg = isDark
    ? 'bg-[#0B0F19] hover:bg-[#18233C] border-slate-800 hover:border-slate-700'
    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow';
  const iconBox = isDark
    ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
    : 'bg-cyan-50 border border-cyan-200 text-cyan-600';
  const demoName = isDark
    ? 'text-white group-hover:text-cyan-400'
    : 'text-slate-900 group-hover:text-cyan-600';
  const demoRole = isDark ? 'text-slate-400' : 'text-slate-500';
  const arrowCls = isDark
    ? 'text-slate-500 group-hover:text-cyan-400'
    : 'text-slate-400 group-hover:text-cyan-600';
  const inputCls = isDark
    ? 'bg-[#0B0F19] border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500';
  const selectCls = isDark
    ? 'bg-[#0B0F19] border-slate-800 text-white focus:border-cyan-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500';
  const labelCls = isDark ? 'text-slate-300' : 'text-slate-700';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlay} backdrop-blur-sm animate-in fade-in duration-200`}>
      <div className={`relative w-full max-w-md ${bg} border ${border} rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5`}>

        {/* Close */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors cursor-pointer ${closeBtnCls}`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <h3 className={`text-2xl font-bold tracking-tight ${titleCls}`}>{t('authTitle')}</h3>
          <p className={`text-xs ${subCls}`}>{t('authSubtitle')}</p>
        </div>

        {/* Tab Switch */}
        <div className={`grid grid-cols-2 gap-1 p-1 rounded-2xl border text-xs font-semibold ${tabBarBg}`}>
          <button
            onClick={() => setTab('demo')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${tab === 'demo' ? tabActive : tabIdle}`}
          >
            {t('quickDemoTab')}
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${tab === 'custom' ? tabActive : tabIdle}`}
          >
            {t('customProfileTab')}
          </button>
        </div>

        {/* Content */}
        {tab === 'demo' ? (
          <div className="space-y-3">
            <p className={`text-xs ${subCls}`}>{t('demoPickHint')}</p>
            <div className="space-y-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectDemo(u)}
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between text-left group cursor-pointer ${demoCardBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBox}`}>
                      {u.role === 'inspector' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className={`text-sm font-bold transition-colors ${demoName}`}>{u.name}</div>
                      <div className={`text-xs ${demoRole}`}>
                        {u.role === 'inspector' ? t('akimatRole') : t('citizenRole')}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-all ${arrowCls}`} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${labelCls}`}>{t('yourName')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Канат Сейфуллин"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${inputCls}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${labelCls}`}>{t('yourDistrict')}</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as District)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${selectCls}`}
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{getDistrictLabel(d, language)}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              {t('createCitizenAccount')}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
