
import React from 'react';
import { Property, HosthubAvailability } from '../types';
import { hosthubService } from '../services/hosthubService';
import { 
  ArrowLeft, Users, 
  AlertCircle, Loader2, 
  BedDouble, Bath 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
  onBookNow: (booking: any) => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack, onBookNow }) => {
  const { t, language } = useLanguage();
  const [dates, setDates] = React.useState({ checkIn: '', checkOut: '' });
  const [availability, setAvailability] = React.useState<HosthubAvailability[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [totalPrice, setTotalPrice] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const checkInRef = React.useRef<HTMLInputElement>(null);
  const checkOutRef = React.useRef<HTMLInputElement>(null);

  // Content Localization
  const title = language === 'el' ? (property.titleEl || property.title) : property.title;
  const description = language === 'el' ? (property.descriptionEl || property.description) : property.description;
  const category = language === 'el' ? (property.categoryEl || property.category) : property.category;
  const amenities = language === 'el' ? (property.amenitiesEl || property.amenities) : property.amenities;

  const fetchAvailability = async () => {
    if (!dates.checkIn || !dates.checkOut) return;
    if (new Date(dates.checkOut) <= new Date(dates.checkIn)) {
      setError(t('errorDateOrder'));
      setAvailability([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await hosthubService.getAvailability(property.hosthubListingId, dates.checkIn, dates.checkOut);
      const isAvailable = res.length > 0 && res.every(d => d.available);
      
      if (!isAvailable && res.length > 0) {
        setError(t('errorUnavailable'));
      } else if (res.length === 0) {
        setError(t('errorVerify'));
      }

      setAvailability(res);
      const sum = res.reduce((acc, curr) => acc + (curr.price || property.pricePerNightBase), 0);
      setTotalPrice(sum);
    } catch (e) {
      setError(t('errorComm'));
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAvailability();
  }, [dates]);

  const canBook = dates.checkIn && dates.checkOut && availability.length > 0 && availability.every(d => d.available) && !isLoading && !error;
  
  const cleaningFee = property.cleaningFee || 30;
  const nights = availability.length;
  const resilienceFeePerNight = property.climateCrisisTax || 1.5;
  
  const totalTax = nights * resilienceFeePerNight;
  const grandTotal = totalPrice + cleaningFee + totalTax;

  const handleOpenPicker = (type: 'in' | 'out') => {
    const input = type === 'in' ? checkInRef.current : checkOutRef.current;
    if (input) {
      const el = input as any;
      if (typeof el.showPicker === 'function') {
        el.showPicker();
      } else {
        el.click();
      }
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-32">
      {/* HEADER IMAGE */}
      <div className="h-[60vh] relative overflow-hidden">
        <img src={property.images[0]} className="w-full h-full object-cover" alt="Main" />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-28 left-4 md:left-12">
            <button onClick={onBack} className="flex items-center gap-3 text-white hover:text-gold-400 font-bold text-xs uppercase tracking-[0.2em] transition-colors bg-black/20 backdrop-blur-sm px-6 py-3 border border-white/10">
              <ArrowLeft size={14} /> {t('backToCollection')}
            </button>
        </div>
        <div className="absolute bottom-12 left-4 md:left-12 text-white">
           <span className="block text-gold-400 text-sm font-bold uppercase tracking-[0.3em] mb-4">{category}</span>
           <h1 className="text-5xl md:text-7xl font-serif leading-none">{title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-20 bg-white p-12 shadow-xl border-t-4 border-gold-500">
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-between gap-8 py-8 border-b border-stone-100">
              <div className="flex items-center gap-4">
                 <Users size={20} className="text-gold-600"/>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{t('capacity')}</span>
                    <span className="font-serif text-lg">{property.capacity} {t('guests')}</span>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <BedDouble size={20} className="text-gold-600"/>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{t('bedrooms')}</span>
                    <span className="font-serif text-lg">{property.bedrooms}</span>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <Bath size={20} className="text-gold-600"/>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{t('bathrooms')}</span>
                    <span className="font-serif text-lg">{property.bathrooms}</span>
                 </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-3xl font-serif text-stone-900 mb-8">{t('experience')}</h3>
              <p className="text-lg text-stone-600 leading-relaxed font-light text-justify first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-gold-600">
                {description}
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-4">
               <img src={property.images[1] || property.images[0]} className="w-full aspect-[4/3] object-cover" alt="Detail" />
               <img src={property.images[2] || property.images[0]} className="w-full aspect-[4/3] object-cover" alt="Detail" />
            </div>

            {/* Amenities */}
            <div className="bg-stone-50 p-12">
              <h4 className="text-2xl font-serif mb-8 text-stone-900">{t('amenities')}</h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {amenities.map(a => (
                  <div key={a} className="flex items-center gap-3 text-stone-700">
                    <div className="w-1.5 h-1.5 bg-gold-500 transform rotate-45" />
                    <span className="font-light">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs mb-4 text-stone-400">{t('houseRules')}</h4>
                <ul className="space-y-3">
                    {property.houseRules.map((rule, i) => (
                      <li key={i} className="text-stone-600 font-light text-sm border-b border-stone-100 pb-2">
                        {rule}
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                 <h4 className="font-bold uppercase tracking-widest text-xs mb-4 text-stone-400">{t('cancellation')}</h4>
                 <p className="text-stone-600 font-light text-sm italic">{property.cancellationPolicy}</p>
              </div>
            </div>
          </div>

          {/* BOOKING SIDEBAR */}
          <div className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="sticky top-32 bg-stone-900 text-white p-10 shadow-2xl">
              <div className="flex justify-between items-end mb-8 border-b border-white/20 pb-8">
                <div>
                   <span className="block text-gold-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('startFrom')}</span>
                   <span className="text-4xl font-serif">€{property.pricePerNightBase}</span>
                </div>
                <span className="text-stone-400 font-light italic">{t('perNight')}</span>
              </div>

              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 border border-white/20 divide-x divide-white/20">
                  <div onClick={() => handleOpenPicker('in')} className="p-4 cursor-pointer hover:bg-white/5 transition-colors relative">
                    <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('checkIn')}</label>
                    <div className="font-serif text-lg">{dates.checkIn || t('select')}</div>
                    <input ref={checkInRef} type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => setDates(prev => ({ ...prev, checkIn: e.target.value }))} />
                  </div>
                  <div onClick={() => handleOpenPicker('out')} className="p-4 cursor-pointer hover:bg-white/5 transition-colors relative">
                    <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('checkOut')}</label>
                    <div className="font-serif text-lg">{dates.checkOut || t('select')}</div>
                    <input ref={checkOutRef} type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => setDates(prev => ({ ...prev, checkOut: e.target.value }))} />
                  </div>
                </div>
                
                {error && (
                  <div className="text-rose-400 text-xs italic flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
              </div>

              {canBook && (
                <div className="space-y-3 mb-8 text-sm font-light text-stone-300 border-t border-white/10 pt-6">
                  <div className="flex justify-between">
                    <span>€{Math.round(totalPrice / nights)} x {nights} nights</span>
                    <span className="text-white">€{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('cleaning')}</span>
                    <span className="text-white">€{cleaningFee}</span>
                  </div>
                   <div className="flex justify-between">
                    <span>{t('climateTax')} ({nights} nights)</span>
                    <span className="text-white">€{totalTax}</span>
                  </div>
                  <div className="flex justify-between text-xl font-serif text-gold-400 pt-4 border-t border-white/10">
                    <span>{t('total')}</span>
                    <span>€{grandTotal}</span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => onBookNow({ checkIn: dates.checkIn, checkOut: dates.checkOut, guests: 1, totalPrice: grandTotal, propertyId: property.id })}
                disabled={!canBook}
                className={`w-full py-5 text-stone-900 font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  canBook ? "bg-white hover:bg-gold-500 hover:text-white" : "bg-stone-800 text-stone-600 cursor-not-allowed"
                }`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : t('reserve')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
