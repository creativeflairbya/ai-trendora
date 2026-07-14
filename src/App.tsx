import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { SignalEnginePage } from './components/SignalEnginePage';
import { TopScannerPage } from './components/TopScannerPage';
import { WatchlistAlertsPage } from './components/WatchlistAlertsPage';
import { AdminPanelPage } from './components/AdminPanelPage';
import { AuthPage } from './components/AuthPage';
import { LearnPage } from './components/LearnPage';
import { Footer } from './components/Footer';
import { PricingModal } from './components/PricingModal';
import { CapitalShieldModal } from './components/CapitalShieldModal';
import { UserProfile } from './types';
import { ACCOUNT_PRESETS } from './data/serverConfig';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [showCapitalShield, setShowCapitalShield] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('chartsignal-auth') === 'true');

  // Initialize with Unrestricted Master Account by default
  const [user, setUser] = useState<UserProfile>(ACCOUNT_PRESETS.master);

  useEffect(() => {
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', `/${window.location.search}`);
      setCurrentTab('login');
    }
  }, []);

  const protectedTabs = ['terminal', 'scanner', 'watchlist', 'admin'];
  const showLogin = protectedTabs.includes(currentTab) && !isAuthenticated;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* App Bar Navigation */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        setUser={setUser}
        openPricingModal={() => setShowPricingModal(true)}
        openCapitalShield={() => setShowCapitalShield(true)}
      />

      {/* Main View Router */}
      <main>
        {showLogin && (
          <AuthPage
            setUser={(next) => {
              setUser(next);
              setIsAuthenticated(true);
              localStorage.setItem('chartsignal-auth', 'true');
            }}
            setCurrentTab={setCurrentTab}
          />
        )}
        {!showLogin && currentTab === 'home' && (
          <LandingPage
            setCurrentTab={setCurrentTab}
            user={user}
            openPricingModal={() => setShowPricingModal(true)}
            openCapitalShield={() => setShowCapitalShield(true)}
          />
        )}

        {!showLogin && currentTab === 'login' && (
          <AuthPage
            setUser={(next) => {
              setUser(next);
              setIsAuthenticated(true);
              localStorage.setItem('chartsignal-auth', 'true');
            }}
            setCurrentTab={setCurrentTab}
          />
        )}

        {!showLogin && currentTab === 'terminal' && (
          <SignalEnginePage
            user={user}
            setUser={setUser}
            openPricingModal={() => setShowPricingModal(true)}
            openCapitalShield={() => setShowCapitalShield(true)}
          />
        )}

        {!showLogin && currentTab === 'scanner' && (
          <TopScannerPage
            onSelectAsset={() => setCurrentTab('terminal')}
          />
        )}

        {!showLogin && currentTab === 'watchlist' && (
          <WatchlistAlertsPage />
        )}

        {!showLogin && currentTab === 'admin' && (
          <AdminPanelPage />
        )}

        {!showLogin && currentTab === 'learn' && (
          <LearnPage />
        )}
      </main>

      {currentTab !== 'login' && <Footer setCurrentTab={setCurrentTab} openPricingModal={() => setShowPricingModal(true)} />}

      {/* Modals */}
      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          user={user}
          setUser={setUser}
        />
      )}

      {showCapitalShield && (
        <CapitalShieldModal
          onClose={() => setShowCapitalShield(false)}
        />
      )}
    </div>
  );
}
