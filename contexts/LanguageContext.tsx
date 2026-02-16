
import React, { createContext, useContext, useState } from 'react';

type Language = 'el' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    bookNow: "Book Now",
    residences: "Residences",
    location: "Location",
    explore: "Explore Collection",
    viewResidence: "View Residence",
    capacity: "Capacity",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guests: "Guests",
    total: "Total",
    reserve: "Reserve Now",
    perNight: "/ night",
    startFrom: "Starting from",
    amenities: "Amenities & Features",
    houseRules: "House Rules",
    cancellation: "Cancellation",
    experience: "The Experience",
    backToCollection: "Back to Collection",
    taxes: "Taxes",
    cleaning: "Cleaning & Concierge",
    climateTax: "Climate Crisis Tax",
    payTotal: "Total Payment",
    secureCheckout: "Secure Checkout",
    guestDetails: "Guest Details",
    payment: "Payment",
    name: "Full Name",
    phone: "Phone",
    email: "Email",
    cardDetails: "Card Details",
    confirmPay: "Confirm & Pay",
    processing: "Processing...",
    success: "Booking Confirmed!",
    successMsg: "Thank you for your trust. A confirmation email has been sent to",
    redirecting: "Redirecting...",
    footerDesc: "A sanctuary of 17 luxury apartments in the heart of Thessaloniki. Meticulously renovated in 2024.",
    concierge: "Concierge",
    story: "Our Story",
    events: "Private Events",
    privacy: "Privacy Policy",
    terms: "Terms of Stay",
    directRate: "Direct Booking Rate",
    whyBookDirect: "Why Book Direct?",
    lowestPrice: "Guaranteed Lowest Price",
    priorityCheckin: "Priority Check-in",
    noFees: "No Hidden Fees",
    viewSuites: "View Available Suites",
    heroTitle: "TOWER 15",
    heroSubtitle: "Thessaloniki Center",
    heroText: "A sanctuary of minimalist luxury. Experience the pinnacle of hospitality across eight levels in the heart of the city.",
    introQuote: "Redefining urban living with a perfect blend of history and modern design.",
    level: "Level",
    otherCollections: "Other Collections",
    addressTitle: "The Address",
    addressText: "Strategically positioned next to Plateia Dimokratias. A heartbeat away from the vibrant Ladadika district and the historic port.",
    navigate: "Navigate via Google Maps",
    confirmAvailability: "Confirmed Availability",
    stay: "Stay",
    secureSSL: "256-bit SSL Encryption. Your data is fully protected.",
    selection: "Selection",
    successTitle: "Booking Completed!",
    payWithCard: "Pay with Card",
    select: "Select"
  },
  el: {
    bookNow: "Κράτηση",
    residences: "Διαμονή",
    location: "Τοποθεσία",
    explore: "Εξερευνήστε",
    viewResidence: "Προβολή",
    capacity: "Άτομα",
    bedrooms: "Υπνοδωμάτια",
    bathrooms: "Μπάνια",
    checkIn: "Άφιξη",
    checkOut: "Αναχώρηση",
    guests: "Επισκέπτες",
    total: "Σύνολο",
    reserve: "Κάντε Κράτηση",
    perNight: "/ βράδυ",
    startFrom: "Από",
    amenities: "Παροχές",
    houseRules: "Κανόνες Σπιτιού",
    cancellation: "Ακύρωση",
    experience: "Η Εμπειρία",
    backToCollection: "Πίσω στη Συλλογή",
    taxes: "Φόροι",
    cleaning: "Καθαρισμός & Concierge",
    climateTax: "Φόρος Ανθεκτικότητας",
    payTotal: "Πληρωμή",
    secureCheckout: "Ασφαλής Πληρωμή",
    guestDetails: "Στοιχεία Επισκέπτη",
    payment: "Πληρωμή",
    name: "Ονοματεπώνυμο",
    phone: "Τηλέφωνο",
    email: "Email",
    cardDetails: "Στοιχεία Κάρτας",
    confirmPay: "Πληρωμή & Επιβεβαίωση",
    processing: "Επεξεργασία...",
    success: "Η κράτηση ολοκληρώθηκε!",
    successMsg: "Σας ευχαριστούμε για την εμπιστοσύνη. Έχει σταλεί email επιβεβαίωσης στο",
    redirecting: "Ανακατεύθυνση...",
    footerDesc: "Ένα καταφύγιο 17 πολυτελών διαμερισμάτων στην καρδιά της Θεσσαλονίκης. Πλήρως ανακαινισμένο το 2024.",
    concierge: "Υπηρεσίες",
    story: "Η Ιστορία μας",
    events: "Ιδιωτικές Εκδηλώσεις",
    privacy: "Πολιτική Απορρήτου",
    terms: "Όροι Διαμονής",
    directRate: "Προνομιακή Τιμή",
    whyBookDirect: "Γιατί απευθείας;",
    lowestPrice: "Εγγύηση Χαμηλότερης Τιμής",
    priorityCheckin: "Προτεραιότητα Check-in",
    noFees: "Χωρίς Κρυφές Χρεώσεις",
    viewSuites: "Δείτε τα Δωμάτια",
    heroTitle: "TOWER 15",
    heroSubtitle: "Κέντρο Θεσσαλονίκης",
    heroText: "Ένα καταφύγιο μινιμαλιστικής πολυτέλειας. Ζήστε την κορυφαία εμπειρία φιλοξενίας σε οκτώ επίπεδα στην καρδιά της πόλης.",
    introQuote: "Επαναπροσδιορίζουμε την αστική διαβίωση με έναν τέλειο συνδυασμό ιστορίας και μοντέρνου σχεδιασμού.",
    level: "Επίπεδο",
    otherCollections: "Άλλες Συλλογές",
    addressTitle: "Η Διεύθυνση",
    addressText: "Στρατηγικά τοποθετημένο δίπλα στην Πλατεία Δημοκρατίας. Μια ανάσα από τα Λαδάδικα και το ιστορικό λιμάνι.",
    navigate: "Πλοήγηση μέσω Google Maps",
    confirmAvailability: "Επιβεβαιωμένη Διαθεσιμότητα",
    stay: "Διαμονή",
    secureSSL: "256-bit Κρυπτογράφηση SSL. Τα δεδομένα σας είναι ασφαλή.",
    selection: "Επιλογή",
    successTitle: "Η κράτηση ολοκληρώθηκε!",
    payWithCard: "Πληρωμή με Κάρτα",
    select: "Επιλογή"
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'el',
  setLanguage: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('el');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
