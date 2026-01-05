
import React, { useState, useEffect } from 'react';
import { User, Listing, AppLanguage, AdminConfig } from './types';
import { TRANSLATIONS } from './constants';
import { DatabaseService } from './services/database';
import { getNearbyServices } from './services/gemini';

// Components
import Registration from './components/Registration';
import Home from './components/Home';
import Profile from './components/Profile';
import ListingForm from './components/ListingForm';
import AdminPanel from './components/AdminPanel';
import ChatBot from './components/ChatBot';
import ShareModal from './components/ShareModal';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(DatabaseService.getCurrentUser());
  const [language, setLanguage] = useState<AppLanguage>(DatabaseService.getLanguage());
  const [config, setConfig] = useState<AdminConfig>(DatabaseService.getConfig());
  const [view, setView] = useState<'home' | 'profile' | 'add' | 'admin' | 'chat' | 'maps'>('home');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sharingItem, setSharingItem] = useState<{ title: string; url: string } | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    // Basic Deep Linking: ?listing=xyz
    const params = new URLSearchParams(window.location.search);
    const listingId = params.get('listing');
    if (listingId) {
      setSelectedListingId(listingId);
      setView('home');
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect if already installed/standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (!isStandalone) {
      // Suggest installation after 5 seconds if not installed
      const timer = setTimeout(() => setShowInstallPrompt(true), 5000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    DatabaseService.setCurrentUser(null);
    setCurrentUser(null);
    setView('home');
  };

  const handleLangToggle = () => {
    const next = language === AppLanguage.AR ? AppLanguage.EN : AppLanguage.AR;
    setLanguage(next);
    DatabaseService.setLanguage(next);
  };

  const handleShareApp = () => {
    setSharingItem({
      title: language === AppLanguage.AR ? config.appNameAr : config.appNameEn,
      url: window.location.origin + window.location.pathname
    });
  };

  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setView('add');
  };

  // Dynamic Styling Injection
  const dynamicStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Almarai:wght@400;700&family=El+Messiri:wght@400;700&family=Roboto:wght@400;700&display=swap');
    
    :root {
      --primary-color: ${config.primaryColor};
      --secondary-color: ${config.secondaryColor};
      --m1-color: ${config.m1Color};
      --app-font: ${config.fontFamily};
    }
    body {
      font-family: var(--app-font), sans-serif !important;
    }
    .bg-primary { background-color: var(--primary-color) !important; }
    .text-primary { color: var(--primary-color) !important; }
    .border-primary { border-color: var(--primary-color) !important; }
    .bg-secondary { background-color: var(--secondary-color) !important; }
    .text-secondary { color: var(--secondary-color) !important; }
    .bg-m1 { background-color: var(--m1-color) !important; }
    .text-m1 { color: var(--m1-color) !important; }
  `;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white" style={{ direction: language === AppLanguage.AR ? 'rtl' : 'ltr' }}>
        <style>{dynamicStyles}</style>
        <Registration onVerified={(user) => {
          DatabaseService.setCurrentUser(user);
          setCurrentUser(user);
        }} lang={language} onLangToggle={handleLangToggle} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-gray-50" style={{ direction: language === AppLanguage.AR ? 'rtl' : 'ltr' }}>
      <style>{dynamicStyles}</style>
      
      {/* Install App Prompt (Mobile) */}
      {showInstallPrompt && (
        <div className="fixed bottom-24 left-4 right-4 z-50 bg-white shadow-2xl rounded-2xl p-4 border border-blue-100 flex items-center justify-between animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">S</div>
            <div>
              <p className="font-black text-sm">{language === AppLanguage.AR ? 'تثبيت سمسار' : 'Install Sumsar'}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{language === AppLanguage.AR ? 'احصل على تجربة التطبيق الكاملة' : 'Get the full app experience'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowInstallPrompt(false)} className="text-gray-400 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            <button onClick={() => alert(language === AppLanguage.AR ? 'للتثبيت: اضغط على "مشاركة" ثم "إضافة إلى الشاشة الرئيسية"' : 'To install: Tap "Share" then "Add to Home Screen"')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg">
              {language === AppLanguage.AR ? 'تثبيت' : 'Install'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center justify-between bg-primary">
        <div className="flex items-center gap-2">
          <img src={config.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
          <h1 className="text-xl font-bold text-white">
            {language === AppLanguage.AR ? config.appNameAr : config.appNameEn}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleShareApp} className="p-2 text-white hover:bg-white/10 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z"/></svg>
          </button>
          <button onClick={handleLangToggle} className="text-white bg-black/20 px-3 py-1 rounded text-sm font-medium">
            {language === AppLanguage.AR ? 'EN' : 'AR'}
          </button>
          {currentUser.isAdmin && (
            <button onClick={() => setView('admin')} className="p-2 text-white hover:bg-white/10 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
          )}
        </div>
      </header>

      {/* Warnings Bar */}
      <div className="bg-yellow-100 text-yellow-800 text-xs py-2 px-4 border-b border-yellow-200 text-center animate-pulse">
        {t.commissionWarning}
      </div>

      {!isOnline && (
        <div className="bg-red-500 text-white text-xs py-1 px-4 text-center">
          {t.offlineMode}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        {view === 'home' && (
          <Home 
            lang={language} 
            user={currentUser} 
            config={config} 
            highlightListingId={selectedListingId} 
            onShare={(item) => setSharingItem(item)} 
            onOpenAdmin={() => setView('admin')}
            onEditListing={handleEditListing}
          />
        )}
        {view === 'profile' && <Profile user={currentUser} setUser={setCurrentUser} onLogout={handleLogout} lang={language} onShareApp={handleShareApp} />}
        {view === 'add' && (
          <ListingForm 
            user={currentUser} 
            onComplete={() => { setView('home'); setEditingListing(null); }} 
            lang={language} 
            listing={editingListing || undefined} 
          />
        )}
        {view === 'admin' && <AdminPanel lang={language} config={config} setConfig={setConfig} onBack={() => setView('home')} />}
        {view === 'chat' && <ChatBot lang={language} />}
        {view === 'maps' && <NearbyServicesView lang={language} />}
      </main>

      {/* Sharing Modal */}
      {sharingItem && (
        <ShareModal 
          isOpen={!!sharingItem} 
          onClose={() => setSharingItem(null)} 
          title={sharingItem.title} 
          url={sharingItem.url} 
          lang={language}
        />
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 pb-safe px-4 shadow-lg z-40">
        <NavButton active={view === 'home'} onClick={() => { setView('home'); setSelectedListingId(null); setEditingListing(null); }} icon="home" label={t.listings} />
        <NavButton active={view === 'add'} onClick={() => { setView('add'); setEditingListing(null); }} icon="plus" label={t.addListing} />
        <NavButton active={view === 'chat'} onClick={() => setView('chat')} icon="chat" label="AI" />
        <NavButton active={view === 'maps'} onClick={() => setView('maps')} icon="map" label="Services" />
        <NavButton active={view === 'profile'} onClick={() => setView('profile')} icon="user" label={t.profile} />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => {
  const getIcon = () => {
    switch (icon) {
      case 'home': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
      case 'plus': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>;
      case 'chat': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>;
      case 'map': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
      case 'user': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
      default: return null;
    }
  };

  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-gray-500'}`}>
      {getIcon()}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
};

const NearbyServicesView: React.FC<{ lang: AppLanguage }> = ({ lang }) => {
  const [services, setServices] = useState<{ text: string, links: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await getNearbyServices(pos.coords.latitude, pos.coords.longitude);
      setServices(res);
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">{TRANSLATIONS[lang].nearbyServices}</h2>
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : services ? (
        <div className="space-y-4">
          <p className="text-gray-700 whitespace-pre-wrap">{services.text}</p>
          <div className="grid grid-cols-1 gap-2">
            {services.links.map((chunk, i) => chunk.maps && (
              <a key={i} href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-primary rounded-lg flex items-center justify-between hover:bg-blue-100 border border-blue-100">
                <span className="font-bold">{chunk.maps.title || "View on Maps"}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <p>No services found.</p>
      )}
    </div>
  );
}

export default App;
