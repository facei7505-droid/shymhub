import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Navbar, type TabType } from './components/Navbar';
import { Arena } from './components/Arena';
import { CityMap } from './components/CityMap';
import { InspectorDashboard } from './components/InspectorDashboard';
import { AddProblemModal } from './components/AddProblemModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SettingsModal } from './components/SettingsModal';
import type { Problem, User, AppSettings, ThemeMode, Language } from './types';
import { getProblems, resetProblems } from './utils/storage';
import { getCurrentUser, logoutUser, incrementUserVote, incrementUserProblem, fetchCurrentUser } from './utils/auth';
import { getAppSettings, saveAppSettings } from './utils/settings';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('arena');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  const refreshData = () => {
    setProblems(getProblems());
    setCurrentUser(getCurrentUser());
    setSettings(getAppSettings());
  };

  useEffect(() => {
    refreshData();
    fetchCurrentUser().then(user => {
      if (user) setCurrentUser(user);
    });
  }, []);

  const handleVoteCompleted = () => {
    if (currentUser) {
      const updated = incrementUserVote();
      if (updated) setCurrentUser(updated);
    }
    refreshData();
  };

  const handleResetData = () => {
    if (window.confirm('Сбросить все рейтинги и вернуться к исходным 20 проблемам Шымкента?')) {
      const initial = resetProblems();
      setProblems(initial);
    }
  };

  const handleOpenAddModal = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleProblemAdded = (_newProblem: Problem) => {
    if (currentUser) {
      const updated = incrementUserProblem();
      if (updated) setCurrentUser(updated);
    }
    refreshData();
    setActiveTab('map');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    saveAppSettings(newSettings);
    setSettings(newSettings);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme };
    handleSaveSettings(updated);
  };

  const handleChangeLanguage = (lang: Language) => {
    const updated = { ...settings, language: lang };
    handleSaveSettings(updated);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const language = settings.language || 'ru';

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-rose-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        onResetData={handleResetData}
        currentUser={currentUser}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        language={language}
        onChangeLanguage={handleChangeLanguage}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Screen */}
      <main className="flex-1 flex flex-col relative z-10">
        {activeTab === 'arena' && (
          <Arena
            currentUser={currentUser}
            problems={problems}
            settings={settings}
            theme={settings.theme}
            language={language}
            onRequireAuth={() => setIsAuthModalOpen(true)}
            onVoteCompleted={handleVoteCompleted}
            streakCount={0}
            setStreakCount={() => {}}
          />
        )}

        {activeTab === 'map' && (
          <CityMap
            problems={problems}
            theme={settings.theme}
            language={language}
          />
        )}

        {activeTab === 'inspector' && currentUser?.role === 'inspector' && (
          <InspectorDashboard
            problems={problems}
            onDataMutated={refreshData}
            language={language}
          />
        )}

        {activeTab === 'inspector' && currentUser?.role !== 'inspector' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-200 text-amber-600">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                Доступ только для инспекторов
              </h2>
              <p className="text-sm max-w-md text-slate-600">
                Кабинет Акимата и ЖКХ доступен только authorized инспекторам. Пожалуйста, войдите под аккаунтом инспектора.
              </p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold transition-all shadow-lg cursor-pointer"
            >
              Войти как инспектор
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddProblemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProblemAdded={handleProblemAdded}
        currentUser={currentUser}
        language={language}
        theme={settings.theme}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'inspector') {
            setActiveTab('inspector');
          }
        }}
        language={language}
        theme={settings.theme}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        language={language}
        theme={settings.theme}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        problems={problems}
        onDataMutated={refreshData}
      />
    </div>
  );
}

export default App;
