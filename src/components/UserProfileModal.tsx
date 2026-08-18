import React from 'react';
import { X, LogOut, User as UserIcon, MapPin, CheckCircle, FileText } from 'lucide-react';
import type { User, Language, ThemeMode } from '../types';
import { TRANSLATIONS, getDistrictLabel } from '../i18n/translations';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  language?: Language;
  theme?: ThemeMode;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenAuthModal,
  language = 'ru',
  theme = 'dark',
}) => {
  if (!isOpen || !user) return null;

  const isDark = theme === 'dark';
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;

  // ── Style tokens ──────────────────────────────────────────────────────────
  const bg      = isDark ? 'bg-[#131B2E]' : 'bg-white';
  const border  = isDark ? 'border-slate-700' : 'border-slate-200';
  const overlay = isDark ? 'bg-black/60' : 'bg-slate-900/40';
  const divider = isDark ? 'border-slate-800' : 'border-slate-200';
  const title   = isDark ? 'text-white' : 'text-slate-900';
  const sub     = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg  = isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200';
  const cardNum = isDark ? 'text-white' : 'text-slate-900';
  const iconBox = isDark
    ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
    : 'bg-cyan-50 border border-cyan-200 text-cyan-600';
  const closeBtnCls = isDark
    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100';
  const switchBtnCls = isDark
    ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';
  const logoutBtnCls = isDark
    ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20'
    : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlay} backdrop-blur-sm animate-in fade-in duration-200`}>
      <div className={`relative w-full max-w-md ${bg} border ${border} rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5`}>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors cursor-pointer ${closeBtnCls}`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconBox}`}>
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${title}`}>{user.name}</h3>
            <p className={`text-xs ${sub}`}>{user.email}</p>
            {user.district && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                <MapPin className="w-3.5 h-3.5" />
                <span>{getDistrictLabel(user.district, language)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-4 rounded-2xl border text-center space-y-1 ${cardBg}`}>
            <div className={`flex items-center justify-center mb-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className={`text-2xl font-bold ${cardNum}`}>{user.votesCount}</div>
            <div className={`text-xs ${sub}`}>{t('votesGiven')}</div>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1 ${cardBg}`}>
            <div className={`flex items-center justify-center mb-1 ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className={`text-2xl font-bold ${cardNum}`}>{user.problemsReportedCount}</div>
            <div className={`text-xs ${sub}`}>{t('problemsAdded')}</div>
          </div>
        </div>

        {/* Actions */}
        <div className={`space-y-2 pt-1 border-t ${divider}`}>
          <button
            onClick={() => { onClose(); onOpenAuthModal(); }}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer mt-3 ${switchBtnCls}`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{t('switchAccount')}</span>
          </button>

          <button
            onClick={() => { onLogout(); onClose(); }}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${logoutBtnCls}`}
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
