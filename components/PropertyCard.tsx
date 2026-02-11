
import React from 'react';
import { Users, BedDouble, ArrowRight } from 'lucide-react';
import { Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PropertyCardProps {
  property: Property;
  onClick: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const { t, language } = useLanguage();
  
  // Dynamic Localization
  const title = language === 'el' ? (property.titleEl || property.title) : property.title;
  const description = language === 'el' ? (property.shortDescriptionEl || property.shortDescription) : property.shortDescription;
  const category = language === 'el' ? (property.categoryEl || property.category) : property.category;

  return (
    <div 
      className="group cursor-pointer bg-white"
      onClick={() => onClick(property.id)}
    >
      {/* Image Container - Sharp edges, minimal hover zoom */}
      <div className="relative aspect-[4/3] overflow-hidden mb-6">
        <img 
          src={property.images[0]} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
        
        {/* Floating Label */}
        <div className="absolute top-6 left-6 bg-white px-4 py-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900">
            {category}
          </span>
        </div>
      </div>
      
      {/* Content - Minimalist Editorial */}
      <div className="pr-4">
        <div className="flex justify-between items-baseline mb-3">
          <h3 className="text-2xl font-serif text-stone-900 group-hover:text-gold-600 transition-colors duration-300">
            {title}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-lg font-serif italic text-stone-900">€{property.pricePerNightBase}</span>
          </div>
        </div>
        
        <p className="text-stone-500 font-light text-sm line-clamp-2 mb-6 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between border-t border-stone-100 pt-4">
          <div className="flex items-center gap-6 text-stone-400">
            <span className="flex items-center gap-2 text-xs uppercase tracking-widest"><Users size={14} /> {property.capacity}</span>
            <span className="flex items-center gap-2 text-xs uppercase tracking-widest"><BedDouble size={14} /> {property.bedrooms}</span>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900 group-hover:translate-x-2 transition-transform duration-300">
            {t('viewResidence')} <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
