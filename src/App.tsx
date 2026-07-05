import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { SignalEnginePage } from './components/SignalEnginePage';
import { TopScannerPage } from './components/TopScannerPage';
import { WatchlistAlertsPage } from './components/WatchlistAlertsPage';
import { AdminPanelPage } from './components/AdminPanelPage';
import { PricingModal } from './components/PricingModal';
import { CapitalShieldModal } from './components/CapitalShieldModal';
import { UserProfile } from './types';
import { ACCOUNT_PRESETS } from './data/serverConfig';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [showCapitalShield, setShowCapitalShield] = useState<boolean>(false);

  // Initialize with Unrestricted Master Account by default
  const [user, setUser] = useState<UserProfile>(ACCOUNT_PRESETS.master);

  useEffect(() => {
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
      setCurrentTab('home');
    }
  }, []);

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
        {currentTab === 'home' && (
          <LandingPage
            setCurrentTab={setCurrentTab}
            user={user}
            openPricingModal={() => setShowPricingModal(true)}
            openCapitalShield={() => setShowCapitalShield(true)}
          />
        )}

        {currentTab === 'terminal' && (
          <SignalEnginePage
            user={user}
            setUser={setUser}
            openPricingModal={() => setShowPricingModal(true)}
            openCapitalShield={() => setShowCapitalShield(true)}
          />
        )}

        {currentTab === 'scanner' && (
          <TopScannerPage
            onSelectAsset={() => setCurrentTab('terminal')}
          />
        )}

        {currentTab === 'watchlist' && (
          <WatchlistAlertsPage />
        )}

        {currentTab === 'admin' && (
          <AdminPanelPage />
        )}
      </main>

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
