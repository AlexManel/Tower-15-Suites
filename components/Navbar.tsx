
import React from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  brandName: string;
  properties: Property[];
  onPropertySelect: (id: string) => void;
  onHomeClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ properties, onPropertySelect, onHomeClick, brandName }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showRooms, setShowRooms] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  
  const { language, setLanguage, t } = useLanguage();

  // Group properties by category (e.g. Floor)
  const categories = Array.from(new Set(properties.map(p => language === 'el' ? (p.categoryEl || p.category) : p.category)));

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md py-4 border-b border-stone-100' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center">
          
          {/* Brand Logo - Image Based */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={onHomeClick}>
            <img 
              src="/logo.png" 
              alt="TOWER 15" 
              className={`h-12 w-auto object-contain transition-all duration-500 ${scrolled ? '' : 'brightness-0 invert'}`} 
            />
          </div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-12">
            
            {/* Language Switcher (Image Flags) */}
            <div className="flex items-center gap-4 cursor-pointer">
               <button 
                 onClick={() => setLanguage('el')} 
                 className={`hover:scale-110 transition-transform duration-300 ${language === 'el' ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                 title="Ελληνικά"
               >
                 <img src="https://flagcdn.com/h40/gr.png" alt="Greek" className="h-4 w-auto rounded-[2px] shadow-sm" />
               </button>
               
               <span className={`text-xs font-light ${scrolled ? 'text-stone-300' : 'text-white/20'}`}>|</span>
               
               <button 
                 onClick={() => setLanguage('en')} 
                 className={`hover:scale-110 transition-transform duration-300 ${language === 'en' ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                 title="English"
               >
                 <img src="https://flagcdn.com/h40/gb.png" alt="English" className="h-4 w-auto rounded-[2px] shadow-sm" />
               </button>
            </div>

            <div 
              className="relative"
              onMouseEnter={() => setShowRooms(true)}
              onMouseLeave={() => setShowRooms(false)}
            >
              <button 
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors py-4 ${scrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white'}`}
              >
                {t('residences')} <ChevronDown size={14} className={`transition-transform duration-300 ${showRooms ? 'rotate-180' : ''}`} />
              </button>
              
              {showRooms && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white shadow-2xl p-8 grid grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in slide-in-from-top-4 duration-300 border-t-2 border-gold-500">
                  {categories.map(cat => (
                    <div key={cat} className="space-y-4">
                      <h4 className="text-xl font-serif text-stone-900 italic border-b border-stone-100 pb-2">{cat}</h4>
                      <div className="space-y-2">
                        {properties.filter(p => (language === 'el' ? (p.categoryEl || p.category) : p.category) === cat).map(p => (
                          <button 
                            key={p.id}
                            onClick={() => { onPropertySelect(p.id); setShowRooms(false); }}
                            className="w-full text-left flex items-center justify-between group py-1"
                          >
                            <span className="text-sm text-stone-500 group-hover:text-stone-900 group-hover:pl-2 transition-all duration-300">
                                {language === 'el' ? (p.titleEl || p.title) : p.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <a href="#location" className={`text-xs font-bold uppercase tracking-widest transition-colors ${scrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white'}`}>{t('location')}</a>
            
            <button 
              onClick={() => document.getElementById('residences')?.scrollIntoView({ behavior: 'smooth' })}
              className={`px-10 py-3 transition-all text-xs font-bold uppercase tracking-widest border ${scrolled ? 'bg-stone-900 text-white border-stone-900 hover:bg-gold-600 hover:border-gold-600' : 'bg-white text-stone-900 border-white hover:bg-stone-200'}`}
            >
              {t('bookNow')}
            </button>
          </div>

          {/* Mobile Menu Button & Flags */}
          <div className="md:hidden flex items-center gap-5">
            <div className="flex items-center gap-3">
               <button onClick={() => setLanguage('el')} className={`${language === 'el' ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                 <img src="https://flagcdn.com/h40/gr.png" alt="EL" className="h-5 w-auto rounded-[2px]" />
               </button>
               <button onClick={() => setLanguage('en')} className={`${language === 'en' ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                 <img src="https://flagcdn.com/h40/gb.png" alt="EN" className="h-5 w-auto rounded-[2px]" />
               </button>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 transition-colors ${scrolled ? 'text-stone-900' : 'text-white'}`}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-stone-900 z-40 pt-32 px-8 overflow-y-auto">
          <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white">
             <X size={32} />
          </button>
          <div className="space-y-12">
            {categories.map(cat => (
              <div key={cat} className="space-y-4">
                <p className="text-gold-500 font-serif text-2xl italic">{cat}</p>
                <div className="grid gap-4 pl-4 border-l border-white/10">
                  {properties.filter(p => (language === 'el' ? (p.categoryEl || p.category) : p.category) === cat).map(p => (
                    <button 
                      key={p.id}
                      onClick={() => { onPropertySelect(p.id); setIsOpen(false); }}
                      className="text-left text-white/80 hover:text-white text-lg font-light"
                    >
                       {language === 'el' ? (p.titleEl || p.title) : p.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
