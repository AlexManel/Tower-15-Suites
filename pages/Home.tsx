
import React from 'react';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import { ArrowDown, ArrowRight, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeProps {
  properties: Property[];
  onPropertySelect: (id: string) => void;
}

const FLOOR_ORDER = [
  "7th Floor", "6th Floor", "5th Floor", "4th Floor", "3rd Floor", "2nd Floor", "1st Floor", "Ground Floor"
];

const Home: React.FC<HomeProps> = ({ properties, onPropertySelect }) => {
  const { t, language } = useLanguage();

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="/tower15-exterior-night.jpg" 
            className="w-full h-full object-cover opacity-60 scale-105 animate-pulse-slow" 
            alt="Tower 15 Building"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-stone-900"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-8 duration-1000">
             <div className="h-[1px] w-12 bg-gold-500"></div>
             <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.3em]">{t('heroSubtitle')}</span>
             <div className="h-[1px] w-12 bg-gold-500"></div>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white mb-2 leading-none animate-in fade-in zoom-in-95 duration-1000 delay-200">
            TOWER 15
          </h1>
          <p className="text-xl md:text-3xl font-light text-white/90 tracking-[0.4em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            SUITES
          </p>
          
          <p className="text-lg md:text-xl text-stone-200 font-light max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {t('heroText')}
          </p>
          
          <button 
             onClick={() => document.getElementById('residences')?.scrollIntoView({ behavior: 'smooth' })}
             className="group bg-transparent border border-white/20 hover:bg-white hover:text-stone-900 text-white px-10 py-4 transition-all duration-500"
          >
            <span className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em]">
              {t('explore')} <ArrowDown size={16} className="group-hover:translate-y-1 transition-transform"/>
            </span>
          </button>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="py-32 bg-stone-50 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <Star className="w-6 h-6 text-gold-500 mx-auto" />
          <h2 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight">
            "Redefining urban living with a perfect blend of history and modern design."
          </h2>
          <div className="w-px h-24 bg-gold-500 mx-auto"></div>
        </div>
      </section>

      {/* PROPERTIES LIST */}
      <div id="residences" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="space-y-32">
            {FLOOR_ORDER.map((floorName) => {
              const floorProperties = properties.filter(p => p.category === floorName);
              if (floorProperties.length === 0) return null;

              // Extract the localized category name from the first property of this group
              const localizedCategory = language === 'el' 
                ? (floorProperties[0].categoryEl || floorProperties[0].category) 
                : floorProperties[0].category;

              // Logic to get just the number/first word if needed, or display full category
              const displayTitle = language === 'el' ? localizedCategory : floorName.split(" ")[0];

              return (
                <section key={floorName} className="scroll-mt-32">
                  <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 border-b border-stone-100 pb-6">
                    <div>
                      <span className="text-gold-600 font-serif italic text-2xl">{t('level')}</span>
                      <h3 className="text-5xl font-serif text-stone-900 mt-2">{displayTitle}</h3>
                    </div>
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-[0.2em] mt-4 md:mt-0">
                      {floorProperties.length} {t('residences')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {floorProperties.map(p => (
                      <PropertyCard key={p.id} property={p} onClick={onPropertySelect} />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Uncategorized */}
            {properties.some(p => !FLOOR_ORDER.includes(p.category)) && (
              <section className="pt-20 border-t border-stone-200">
                <h3 className="text-3xl font-serif text-stone-900 mb-12">{t('otherCollections')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {properties.filter(p => !FLOOR_ORDER.includes(p.category)).map(p => (
                    <PropertyCard key={p.id} property={p} onClick={onPropertySelect} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* LOCATION SECTION - Luxury Dark Mode */}
        <section id="location" className="mt-32 relative bg-stone-900 text-white py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-[1px] w-8 bg-gold-500"></div>
                     <span className="text-gold-500 font-bold text-xs uppercase tracking-[0.3em]">{t('addressTitle')}</span>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-serif mb-8">Ioannou Farmaki 15</h2>
                  <p className="text-xl text-stone-300 font-light leading-relaxed mb-12">
                    {t('addressText')}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 border-t border-white/10 pt-8">
                    <div>
                      <h4 className="font-serif text-2xl mb-2">Ladadika</h4>
                      <p className="text-stone-500 text-sm">5 min walk · Dining & Culture</p>
                    </div>
                    <div>
                      <h4 className="font-serif text-2xl mb-2">The Port</h4>
                      <p className="text-stone-500 text-sm">8 min walk · Sea View & Museums</p>
                    </div>
                  </div>

                  <a 
                    href="https://www.google.com/maps/place/Ioannou+Farmaki+15,+Thessaloniki+546+29" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 text-white border-b border-gold-500 pb-2 hover:text-gold-400 transition-colors"
                  >
                    <span className="text-sm font-bold uppercase tracking-widest">{t('navigate')}</span> <ArrowRight size={16} />
                  </a>
              </div>
              
              <div className="h-[600px] w-full grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    id="gmap_canvas" 
                    src="https://maps.google.com/maps?q=Ioannou%20Farmaki%2015%2C%20Thessaloniki%20546%2029&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0}
                    title="Tower 15 Location"
                    className="w-full h-full"
                    referrerPolicy="no-referrer-when-downgrade"
                    loading="lazy"
                  ></iframe>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
