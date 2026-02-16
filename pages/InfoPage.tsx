
import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface InfoPageProps {
  title: string;
  subtitle: string;
  content: React.ReactNode;
  onBack: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ title, subtitle, content, onBack }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <div className="bg-stone-900 text-white pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={onBack} 
            className="flex items-center gap-3 text-gold-500 hover:text-gold-400 font-bold text-xs uppercase tracking-[0.2em] transition-colors mb-8"
          >
            <ArrowLeft size={14} /> {t('backToHome')}
          </button>
          <span className="block text-gold-500 font-bold uppercase tracking-[0.3em] text-xs mb-4">{subtitle}</span>
          <h1 className="text-5xl md:text-6xl font-serif">{title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">
        <div className="bg-white p-12 md:p-20 shadow-xl border-t-4 border-gold-500">
          <div className="prose prose-stone prose-lg max-w-none font-light text-stone-600 leading-relaxed">
            {content}
          </div>
          
          <div className="mt-16 pt-12 border-t border-stone-100 flex items-center gap-4 text-stone-400">
             <ShieldCheck size={24} className="text-gold-500" />
             <p className="text-xs font-bold uppercase tracking-widest">{t('officialDocs')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
