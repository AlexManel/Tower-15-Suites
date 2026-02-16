
import React from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import InfoPage from './pages/InfoPage';
import AiAssistant from './components/AiAssistant'; // Now serving as Guest Concierge
import { Property, CMSState } from './types';
import { cmsService } from './services/cmsService';
import { ShieldCheck, Instagram, Facebook } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Content Helper
const getInfoContent = (language: 'en' | 'el', t: any) => ({
  story: {
    title: t('story'),
    subtitle: language === 'el' ? "Ιδρυση 2024" : "Est. 2024",
    content: language === 'el' ? (
      <>
        <p className="mb-6 first-letter:text-5xl first-letter:font-serif first-letter:text-gold-600 first-letter:float-left first-letter:mr-3">
          Το TOWER 15 Suites αντιπροσωπεύει την αναγέννηση της αρχιτεκτονικής κληρονομιάς της Θεσσαλονίκης.
          Τοποθετημένο στην Ιωάννου Φαρμάκη 15, δίπλα στην ιστορική Πλατεία Δημοκρατίας, το κτίριο στέκεται ως μάρτυρας
          της εξελισσόμενης ταυτότητας της πόλης—γεφυρώνοντας το χάσμα μεταξύ του πλούσιου παρελθόντος και του κοσμοπολίτικου μέλλοντος.
        </p>
        <p className="mb-6">
          Το 2024, προχωρήσαμε σε πλήρη ανακαίνιση του ακινήτου. Το όραμά μας ήταν απλό αλλά φιλόδοξο:
          να δημιουργήσουμε ένα καταφύγιο μινιμαλιστικής πολυτέλειας για τον σύγχρονο ταξιδιώτη. Απογυμνώσαμε το κτίριο
          στον δομικό του πυρήνα και επανασχεδιάσαμε κάθε τετραγωνικό μέτρο, χρησιμοποιώντας υλικά υψηλής ποιότητας.
        </p>
      </>
    ) : (
      <>
        <p className="mb-6 first-letter:text-5xl first-letter:font-serif first-letter:text-gold-600 first-letter:float-left first-letter:mr-3">
          TOWER 15 Suites represents the revitalization of Thessaloniki's architectural heritage. 
          Located at Ioannou Farmaki 15, adjacent to the historic Plateia Dimokratias, our building stands as a testament 
          to the city's evolving identity—bridging the gap between its rich past and its cosmopolitan future.
        </p>
        <p className="mb-6">
          In 2024, we undertook a complete renovation of the property. Our vision was simple yet ambitious: 
          to create a sanctuary of minimalist luxury that caters to the modern traveler.
        </p>
      </>
    )
  },
  events: {
    title: t('events'),
    subtitle: language === 'el' ? "Αποκλειστικές Στιγμές" : "Exclusive Gatherings",
    content: language === 'el' ? (
      <p>Επικοινωνήστε μαζί μας στο events@tower15.gr για ιδιωτικές κρατήσεις.</p>
    ) : (
       <p>For inquiries regarding availability and catering partnerships, please contact our concierge team directly at <strong> events@tower15.gr</strong>.</p>
    )
  },
  privacy: {
    title: t('privacy'),
    subtitle: "GDPR",
    content: language === 'el' ? <p>Σεβόμαστε τα προσωπικά σας δεδομένα.</p> : <p>We value your privacy.</p>
  },
  terms: {
    title: t('terms'),
    subtitle: "Policies",
    content: language === 'el' ? <p>Check-in: 15:00, Check-out: 11:00</p> : <p>Check-in: 15:00, Check-out: 11:00</p>
  },
  direct: {
    title: t('directRate'),
    subtitle: language === 'el' ? "Εγγύηση" : "Best Price Guarantee",
    content: language === 'el' ? (
      <>
        <h3 className="text-3xl font-serif text-gold-600 mb-6">{t('whyBookDirect')}</h3>
        <p className="mb-8">Κάνοντας κράτηση απευθείας από το site μας, κερδίζετε την χαμηλότερη τιμή της αγοράς.</p>
        <button 
          onClick={() => document.getElementById('residences')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-stone-900 text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gold-600 transition-colors"
        >
            {t('viewSuites')}
        </button>
      </>
    ) : (
      <>
        <h3 className="text-3xl font-serif text-gold-600 mb-6">{t('whyBookDirect')}</h3>
        <p className="mb-8">When you book directly through tower15.gr, you are dealing directly with us, avoiding third-party commissions.</p>
        <button 
          onClick={() => document.getElementById('residences')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-stone-900 text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gold-600 transition-colors"
        >
            {t('viewSuites')}
        </button>
      </>
    )
  }
});

type ViewState = 'home' | 'property' | 'admin' | 'checkout' | 'info';

const InnerApp: React.FC = () => {
  const [view, setView] = React.useState<ViewState>('home');
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [bookingData, setBookingData] = React.useState<any>(null);
  const [infoPageKey, setInfoPageKey] = React.useState<string | null>(null);
  
  const [cmsState, setCmsState] = React.useState<CMSState>({
    properties: [],
    brandName: '',
    stripePublicKey: '',
    hosthubApiKey: ''
  });
  const [loading, setLoading] = React.useState(true);
  const [logoClicks, setLogoClicks] = React.useState(0);

  const { t, language } = useLanguage();

  // Fetch data from Supabase on Mount
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Note: We don't set loading=true here to avoid full page screen flash on AI updates
    const data = await cmsService.loadContent();
    setCmsState(data);
    setLoading(false);
  };

  const handleAdminExit = async () => {
    await loadData();
    setView('home');
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('manage') === 'secret') {
      setView('admin');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === 'KeyM') {
        setView('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePropertyClick = (id: string) => {
    const prop = cmsState.properties.find(p => p.id === id);
    if (prop) {
      setSelectedProperty(prop);
      setView('property');
      window.scrollTo(0, 0);
    }
  };

  const handleBookNow = (data: any) => {
    setBookingData(data);
    setView('checkout');
  };

  const handleBookingSuccess = () => {
    setView('home');
    setSelectedProperty(null);
    setBookingData(null);
    window.scrollTo(0, 0);
  };

  const handleInfoClick = (key: string) => {
    setInfoPageKey(key);
    setView('info');
    window.scrollTo(0, 0);
  };

  const handleLogoSecretClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 5) {
      setView('admin');
      setLogoClicks(0);
    }
    const timer = setTimeout(() => setLogoClicks(0), 2000);
    return () => clearTimeout(timer);
  };

  if (loading && cmsState.properties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-6">
          {/* Logo on White Background */}
          <img src="/images/logo.png" alt="TOWER 15" className="h-40 w-auto mx-auto animate-pulse object-contain" />
          <p className="text-stone-400 font-bold text-xs uppercase tracking-[0.4em]">{t('curating')}</p>
        </div>
      </div>
    );
  }

  const infoContent = infoPageKey ? getInfoContent(language, t)[infoPageKey as keyof ReturnType<typeof getInfoContent>] : null;

  return (
    <div className="min-h-screen bg-stone-50 relative">
      {/* GLOBAL GUEST CONCIERGE - Read-only access to properties */}
      {view !== 'admin' && (
        <AiAssistant properties={cmsState.properties} />
      )}

      {view !== 'admin' && view !== 'checkout' && view !== 'info' && (
        <Navbar 
          brandName={cmsState.brandName} 
          properties={cmsState.properties}
          onPropertySelect={handlePropertyClick}
          onHomeClick={() => setView('home')}
        />
      )}

      {view === 'home' && (
        <Home 
          properties={cmsState.properties} 
          onPropertySelect={handlePropertyClick} 
        />
      )}

      {view === 'property' && selectedProperty && (
        <PropertyDetail 
          property={selectedProperty} 
          onBack={() => setView('home')} 
          onBookNow={handleBookNow}
        />
      )}

      {view === 'info' && infoContent && (
        <InfoPage 
          title={infoContent.title}
          subtitle={infoContent.subtitle}
          content={infoContent.content}
          onBack={() => setView('home')}
        />
      )}

      {view === 'admin' && (
        <Admin onExit={handleAdminExit} />
      )}

      {view === 'checkout' && selectedProperty && (
        <Checkout 
          bookingData={bookingData} 
          property={selectedProperty} 
          onSuccess={handleBookingSuccess} 
          onCancel={() => setView('property')}
        />
      )}

      {view !== 'admin' && view !== 'checkout' && (
        <footer className="bg-stone-950 text-stone-400 py-32 mt-0 border-t border-stone-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-12 select-none cursor-default group" onClick={handleLogoSecretClick}>
                  <img src="/images/logo.png" alt="TOWER 15" className="h-20 w-auto mr-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500 object-contain brightness-0 invert" />
                  <div>
                     <h3 className="text-white text-3xl font-serif tracking-tight">{cmsState.brandName}</h3>
                     <p className="text-gold-600 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">{t('hospitalityCollection')}</p>
                  </div>
                </div>
                <p className="max-w-md mb-12 leading-relaxed text-lg font-light text-stone-500">
                  {t('footerDesc')}
                </p>
                <div className="flex gap-6">
                  <div className="w-12 h-12 flex items-center justify-center hover:text-gold-500 transition-all cursor-pointer border border-stone-800 rounded-full hover:border-gold-500">
                    <Instagram size={20} />
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center hover:text-gold-500 transition-all cursor-pointer border border-stone-800 rounded-full hover:border-gold-500">
                    <Facebook size={20} />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-gold-600 font-serif italic text-2xl mb-8">{t('residences')}</h4>
                <ul className="space-y-4 text-sm font-bold uppercase tracking-widest overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar-footer pr-2 text-stone-500">
                  {cmsState.properties.slice(0, 8).map(p => (
                    <li key={p.id} onClick={() => handlePropertyClick(p.id)} className="hover:text-white cursor-pointer transition-colors truncate">
                       {language === 'el' ? (p.titleEl || p.title) : p.title}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-gold-600 font-serif italic text-2xl mb-8">{t('concierge')}</h4>
                <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-stone-500">
                  <li onClick={() => handleInfoClick('story')} className="hover:text-white cursor-pointer transition-colors">{t('story')}</li>
                  <li onClick={() => handleInfoClick('events')} className="hover:text-white cursor-pointer transition-colors">{t('events')}</li>
                  <li onClick={() => handleInfoClick('privacy')} className="hover:text-white cursor-pointer transition-colors">{t('privacy')}</li>
                  <li onClick={() => handleInfoClick('terms')} className="hover:text-white cursor-pointer transition-colors">{t('terms')}</li>
                  <li onClick={() => handleInfoClick('direct')} className="text-gold-500 flex items-center gap-2 cursor-pointer group mt-6 hover:text-gold-400">
                    <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" /> 
                    {t('directRate')}
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-32 pt-12 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-600">
              <p>© {new Date().getFullYear()} {cmsState.brandName}. EST. 2024</p>
              <div className="flex items-center gap-8">
                <span className="flex items-center gap-2"><ShieldCheck size={14} /> {t('pciCompliant')}</span>
                <span className="flex items-center gap-2">{t('secureTrans')}</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <InnerApp />
  </LanguageProvider>
);

export default App;
