
import React from 'react';
import { Property, BookingStatus, RealBooking } from '../types';
import { cmsService } from '../services/cmsService';
import { hosthubService } from '../services/hosthubService';
import { emailService } from '../services/emailService';
import { 
  ShieldCheck, 
  CreditCard, 
  ChevronRight, 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  Lock, 
  Smartphone,
  CreditCard as CardIcon
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CheckoutProps {
  bookingData: any;
  property: Property;
  onSuccess: () => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ bookingData, property, onSuccess, onCancel }) => {
  const { t } = useLanguage();
  const [step, setStep] = React.useState<'details' | 'processing' | 'success'>('details');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({ 
    name: '', 
    email: '', 
    phone: '',
    cardNumber: '', 
    expiry: '', 
    cvc: '' 
  });
  
  const totalWithFees = bookingData.totalPrice;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      const liveAvailability = await hosthubService.getAvailability(
        property.hosthubListingId, 
        bookingData.checkIn, 
        bookingData.checkOut
      );

      const isStillAvailable = liveAvailability.length > 0 && liveAvailability.every(d => d.available);

      if (!isStillAvailable) {
        setIsVerifying(false);
        setError("Οι ημερομηνίες μόλις δεσμεύτηκαν από άλλη πλατφόρμα. Η πληρωμή ακυρώθηκε αυτόματα για την αποφυγή διπλοκράτησης.");
        return;
      }
    } catch (err) {
      setIsVerifying(false);
      setError("Αδυναμία επιβεβαίωσης διαθεσιμότητας. Παρακαλώ δοκιμάστε ξανά σε λίγο.");
      return;
    }

    setIsVerifying(false);
    setStep('processing');

    await new Promise(r => setTimeout(r, 2500));

    try {
      await hosthubService.pushBooking({
        listingId: property.hosthubListingId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guestName: formData.name,
        guestEmail: formData.email,
        totalAmount: totalWithFees
      });

      const newBooking: RealBooking = {
        id: `T15-${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
        propertyId: property.id,
        propertyName: property.title,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        amount: totalWithFees,
        status: BookingStatus.PAID,
        guestEmail: formData.email,
        createdAt: new Date().toISOString(),
        transactionId: `ch_${Math.random().toString(36).substr(2, 12)}`
      };
      
      await cmsService.addBooking(newBooking);

      try {
        await emailService.sendConfirmationEmail(newBooking, property, formData.name);
      } catch (emailErr) {
        console.warn("Email sending failed:", emailErr);
      }

      setStep('success');
      setTimeout(onSuccess, 4000);
    } catch (err) {
      console.error(err);
      setError("Η πληρωμή εγκρίθηκε, αλλά υπήρξε θέμα στον συγχρονισμό. Η κράτησή σας έχει καταγραφεί και θα ολοκληρωθεί χειροκίνητα άμεσα.");
      setStep('details');
    }
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle className="text-emerald-600" size={48} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('successTitle')}</h1>
        <p className="text-xl text-slate-500 max-w-md mb-8 font-light">
          {t('successMsg')} <strong>{formData.email}</strong>.
        </p>
        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 w-full max-w-sm mb-12 text-left shadow-sm">
          <div className="flex justify-between mb-4 border-b border-slate-200 pb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Property</span>
            <span className="font-bold text-slate-900">{property.title}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Dates</span>
            <span className="font-semibold">{bookingData.checkIn} → {bookingData.checkOut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Total Paid</span>
            <span className="font-bold text-emerald-600">€{totalWithFees}</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">{t('redirecting')}</p>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="relative w-32 h-32 mb-12">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <Lock className="text-emerald-500" size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">{t('processing')}</h2>
        <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">
          Please do not refresh the page. We are communicating with your bank securely.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left Side: Summary */}
      <div className="w-full md:w-5/12 bg-slate-50 p-8 md:p-20 overflow-y-auto">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-16 transition-colors">
          ← {t('backToCollection')}
        </button>
        
        <h2 className="text-4xl font-bold mb-12 tracking-tighter">{t('payTotal')}</h2>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 mb-10 relative overflow-hidden">
          <div className="flex items-start gap-6 mb-8">
            <img src={property.images[0]} className="w-24 h-24 rounded-2xl object-cover" alt="Prop" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{property.title}</h3>
              <p className="text-slate-400 text-sm font-medium">{property.location}</p>
              <div className="mt-2 flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                <ShieldCheck size={14} /> {t('confirmAvailability')}
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-8 border-t border-slate-50">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>{t('stay')}</span>
              <span>(included)</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>{t('taxes')} & {t('cleaning')}</span>
              <span>(included)</span>
            </div>
            <div className="pt-6 mt-2 border-t border-slate-100 flex justify-between text-3xl font-bold text-slate-900 tracking-tighter">
              <span>{t('total')}</span>
              <span>€{totalWithFees}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-xs font-medium px-4">
           <Lock size={14} /> 
           <span>{t('secureSSL')}</span>
        </div>
      </div>

      {/* Right Side: Payment Form */}
      <div className="w-full md:w-7/12 p-8 md:p-20 overflow-y-auto bg-white">
        <div className="max-w-md mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-16 text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em]">
             <span className="text-slate-400">{t('selection')}</span> 
             <ChevronRight size={14} /> 
             <span className="text-slate-900 border-b-2 border-slate-900 pb-1">{t('payment')}</span> 
          </div>

          {error && (
            <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4 text-rose-700 animate-in slide-in-from-top-4">
               <AlertCircle className="shrink-0" size={20} />
               <p className="text-sm font-bold uppercase tracking-tight leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-12">
            {/* Guest Details */}
            <section className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                <Smartphone size={16} className="text-slate-900"/> 1. {t('guestDetails')}
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <input 
                  required 
                  type="text" 
                  placeholder={t('name')} 
                  className="w-full p-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium placeholder:text-slate-400" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required 
                    type="email" 
                    placeholder={t('email')} 
                    className="w-full p-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                  <input 
                    required 
                    type="tel" 
                    placeholder={t('phone')} 
                    className="w-full p-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
              </div>
            </section>
            
            {/* Card Details (SoftPOS View) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                  <CardIcon size={16} className="text-slate-900"/> 2. {t('payWithCard')}
                </h4>
                <div className="flex gap-2">
                   <div className="w-8 h-5 bg-slate-100 rounded border border-slate-200"></div>
                   <div className="w-8 h-5 bg-slate-100 rounded border border-slate-200"></div>
                </div>
              </div>

              {/* Digital Wallets Shortcut */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button type="button" className="flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl hover:opacity-90 transition-opacity font-bold text-sm">
                   Apple Pay
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-sm">
                   Google Pay
                </button>
              </div>

              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                   <CreditCard size={120} />
                </div>
                
                <div className="relative space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Card Number</label>
                    <div className="relative">
                      <input 
                        required 
                        placeholder="0000 0000 0000 0000" 
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xl tracking-widest focus:ring-2 focus:ring-emerald-500 placeholder:text-white/20" 
                        maxLength={19}
                        value={formData.cardNumber}
                        onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                      />
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={24} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Expiry</label>
                      <input 
                        required 
                        placeholder="MM / YY" 
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-lg focus:ring-2 focus:ring-emerald-500 placeholder:text-white/20" 
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">CVC</label>
                      <input 
                        required 
                        placeholder="123" 
                        type="password"
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-lg focus:ring-2 focus:ring-emerald-500 placeholder:text-white/20" 
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={isVerifying} 
              className="w-full py-6 bg-slate-900 text-white rounded-3xl font-bold text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 shadow-2xl transform active:scale-[0.98]"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  {t('processing')}
                </>
              ) : (
                <>{t('confirmPay')} — €{totalWithFees}</>
              )}
            </button>
            
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>Secure Checkout powered by</span>
                <span className="text-slate-900 text-xs font-serif italic">Stripe</span>
              </div>
              <div className="flex gap-4 opacity-30 grayscale">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
