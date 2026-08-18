import React, { useState } from 'react';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  FileSpreadsheet,
  FileJson,
  Keyboard,
  Check,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import type { AppSettings, Problem, District, Language, ThemeMode } from '../types';
import { soundEngine } from '../utils/audio';
import { exportProblemsToCSV, exportProblemsToJSON } from '../utils/export';
import { TRANSLATIONS, getDistrictLabel } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  problems: Problem[];
  onDataMutated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  problems,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const previewTheme: ThemeMode = localSettings.theme;
  const isDark = previewTheme === 'dark';
  const currentLang = localSettings.language || 'ru';
  const t = (key: string) => TRANSLATIONS[currentLang]?.[key] || key;

  const districts: District[] = ['Аль-Фарабийский', 'Енбекшинский', 'Абайский', 'Каратауский', 'Туран'];

  const handleToggleSound = () => {
    const nextVal = !localSettings.soundEnabled;
    setLocalSettings((prev) => ({ ...prev, soundEnabled: nextVal }));
    if (nextVal) soundEngine.playSuccess();
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 500);
  };

  // ── Style tokens ────────────────────────────────────────────────────────
  const bg       = isDark ? 'bg-[#131B2E]' : 'bg-white';
  const overlay  = isDark ? 'bg-black/70' : 'bg-slate-900/40';
  const border   = isDark ? 'border-slate-700' : 'border-slate-200';
  const divider  = isDark ? 'border-slate-700/80' : 'border-slate-200';
  const label    = isDark ? 'text-slate-200' : 'text-slate-700';
  const sublabel = isDark ? 'text-slate-400' : 'text-slate-500';
  const title    = isDark ? 'text-white' : 'text-slate-900';
  const cardBg   = isDark ? 'bg-[#0B0F19]' : 'bg-slate-50';
  const cardBorder = isDark ? 'border-slate-800' : 'border-slate-200';
  const selectCls = isDark
    ? 'bg-[#0B0F19] border-slate-800 text-white focus:border-emerald-500'
    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500';
  const closeBtnCls = isDark
    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100';

  const optionActive = isDark
    ? 'bg-[#0B0F19] border-rose-500 text-white ring-2 ring-rose-500/25'
    : 'bg-white border-rose-500 text-slate-900 ring-2 ring-rose-500/20 shadow-sm';
  const optionIdle = isDark
    ? 'bg-[#0B0F19]/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
    : 'bg-slate-50 border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400';

  const toggleIdle = isDark
    ? 'bg-[#0B0F19]/60 border-slate-800 text-slate-400'
    : 'bg-slate-50 border-slate-200 text-slate-500';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 ${overlay} backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto`}>
      <div className={`relative w-full max-w-2xl ${bg} border ${border} rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-8`}>

        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-rose-500/10 border border-rose-500/25 text-rose-400' : 'bg-rose-50 border border-rose-200 text-rose-500'
            }`}>
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${title}`}>{t('settingsTitle')}</h3>
              <p className={`text-xs mt-0.5 ${sublabel}`}>{t('settingsSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors cursor-pointer ${closeBtnCls}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">

          {/* SECTION: Language */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${label}`}>
              <Globe className="w-4 h-4 text-cyan-500" />
              <span>{t('languageSection')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([
                { code: 'kz' as Language, label: '🇰🇿 Қазақша' },
                { code: 'ru' as Language, label: '🇷🇺 Русский' },
                { code: 'en' as Language, label: '🇬🇧 English' },
              ] as const).map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLocalSettings((prev) => ({ ...prev, language: item.code }))}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer text-xs font-bold ${
                    localSettings.language === item.code ? optionActive : optionIdle
                  }`}
                >
                  <span>{item.label}</span>
                  {localSettings.language === item.code && <Check className="w-3.5 h-3.5 text-rose-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION: Theme */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${label}`}>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>{t('themeSection')}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocalSettings((prev) => ({ ...prev, theme: 'dark' }))}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  localSettings.theme === 'dark' ? optionActive : optionIdle
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold">{t('darkTheme')}</span>
                </div>
                {localSettings.theme === 'dark' && <Check className="w-4 h-4 text-rose-500" />}
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings((prev) => ({ ...prev, theme: 'light' }))}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  localSettings.theme === 'light'
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-400 text-white ring-2 ring-amber-400/25'
                      : 'bg-amber-50 border-amber-400 text-slate-900 ring-2 ring-amber-300/40 shadow-sm'
                    : optionIdle
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">{t('lightTheme')}</span>
                </div>
                {localSettings.theme === 'light' && <Check className="w-4 h-4 text-amber-500" />}
              </button>
            </div>
          </div>

          {/* SECTION: Matchmaking */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${label}`}>
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>{t('eloSection')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-3.5 rounded-2xl border space-y-2 ${cardBg} ${cardBorder}`}>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('eloDeltaLabel')}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[100, 200, 350].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => setLocalSettings((prev) => ({ ...prev, matchmakingEloDelta: delta }))}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                        localSettings.matchmakingEloDelta === delta
                          ? 'bg-rose-500 text-white border-rose-500 shadow'
                          : isDark
                          ? 'bg-[#131B2E] text-slate-400 border-slate-800 hover:text-white'
                          : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-400'
                      }`}
                    >
                      ±{delta}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border space-y-2 ${cardBg} ${cardBorder}`}>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('districtFocusLabel')}
                </p>
                <select
                  value={localSettings.arenaDistrictFilter}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, arenaDistrictFilter: e.target.value as 'all' | District }))}
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors ${selectCls}`}
                >
                  <option value="all">🌍 {t('entireCity')}</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>📍 {getDistrictLabel(d, currentLang)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION: Audio & UI */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${label}`}>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t('soundSection')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {/* Sound */}
              <div
                onClick={handleToggleSound}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  localSettings.soundEnabled
                    ? `${isDark ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'}`
                    : toggleIdle
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    localSettings.soundEnabled
                      ? isDark ? 'text-emerald-300' : 'text-emerald-700'
                      : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>{t('soundEffects')}</span>
                  {localSettings.soundEnabled
                    ? <Volume2 className="w-4 h-4 text-emerald-500" />
                    : <VolumeX className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />}
                </div>
                <div className={`text-[10px] ${sublabel}`}>
                  {localSettings.soundEnabled ? t('soundActive') : t('soundDisabled')}
                </div>
              </div>

              {/* Animation */}
              <div
                onClick={() => setLocalSettings((prev) => ({ ...prev, confettiEnabled: !prev.confettiEnabled }))}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  localSettings.confettiEnabled
                    ? `${isDark ? 'bg-rose-500/10 border-rose-500/40' : 'bg-rose-50 border-rose-300'}`
                    : toggleIdle
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    localSettings.confettiEnabled
                      ? isDark ? 'text-rose-300' : 'text-rose-700'
                      : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>{t('confetti')}</span>
                  <Sparkles className={`w-4 h-4 ${localSettings.confettiEnabled ? 'text-rose-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <div className={`text-[10px] ${sublabel}`}>
                  {localSettings.confettiEnabled ? t('confettiActive') : t('confettiDisabled')}
                </div>
              </div>

              {/* Keyboard */}
              <div
                onClick={() => setLocalSettings((prev) => ({ ...prev, keyboardShortcutsEnabled: !prev.keyboardShortcutsEnabled }))}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  localSettings.keyboardShortcutsEnabled
                    ? `${isDark ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-cyan-50 border-cyan-300'}`
                    : toggleIdle
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    localSettings.keyboardShortcutsEnabled
                      ? isDark ? 'text-cyan-300' : 'text-cyan-700'
                      : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>{t('keyboardShortcuts')}</span>
                  <Keyboard className={`w-4 h-4 ${localSettings.keyboardShortcutsEnabled ? 'text-cyan-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <div className={`text-[10px] ${sublabel}`}>
                  {localSettings.keyboardShortcutsEnabled ? t('shortcutsActive') : t('shortcutsDisabled')}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION: Export */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${label}`}>
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>{t('exportSection')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => exportProblemsToCSV(problems)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between group transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#0B0F19] border-slate-800 hover:border-emerald-500/50'
                    : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className={`text-xs font-bold group-hover:text-emerald-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('downloadCsv')}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${sublabel}`}>{problems.length} записей</div>
                </div>
                <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => exportProblemsToJSON(problems)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between group transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#0B0F19] border-slate-800 hover:border-cyan-500/50'
                    : 'bg-slate-50 border-slate-200 hover:border-cyan-400'
                }`}
              >
                <div>
                  <div className={`text-xs font-bold group-hover:text-cyan-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('downloadJson')}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${sublabel}`}>JSON API Data</div>
                </div>
                <FileJson className="w-5 h-5 text-cyan-500 shrink-0" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`pt-4 flex items-center justify-between border-t ${divider}`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('close')}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-rose-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <><Check className="w-4 h-4" />{t('saved')}</>
            ) : (
              <span>{t('saveSettings')}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
