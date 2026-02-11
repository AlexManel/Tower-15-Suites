
import { Property } from './types';

const T15_AMENITIES = [
  "Free High-Speed WiFi", 
  "Air Conditioning (Inverter)", 
  "Smart TV 43\" with Netflix", 
  "Nespresso Machine", 
  "Fully Equipped Kitchenette", 
  "Private Bathroom", 
  "Rain Shower",
  "Hairdryer", 
  "Refrigerator", 
  "Anatomic Mattress",
  "Electronic Door Lock",
  "Soundproof Windows"
];

const T15_AMENITIES_EL = [
  "Δωρεάν WiFi Υψηλής Ταχύτητας", 
  "Κλιματισμός (Inverter)", 
  "Smart TV 43\" με Netflix", 
  "Μηχανή Nespresso", 
  "Πλήρως Εξοπλισμένο Κουζινάκι", 
  "Ιδιωτικό Μπάνιο", 
  "Ντουζιέρα Rain Shower",
  "Σεσουάρ Μαλλιών", 
  "Ψυγείο", 
  "Ανατομικό Στρώμα",
  "Ηλεκτρονική Κλειδαριά",
  "Ηχομονωτικά Παράθυρα"
];

const T15_RULES = [
  "No smoking allowed inside",
  "No pets allowed",
  "No parties or events",
  "Quiet hours: 11:00 PM - 08:00 AM",
  "Check-in: 15:00 - Check-out: 11:00"
];

const SHARED_DESC = "The Tower 15 Suites is a gem in the heart of Thessaloniki, next to Democracy Square. Fully renovated in 2024 with luxury materials and modern aesthetics.";
const SHARED_DESC_EL = "Το Tower 15 Suites είναι ένα διαμάντι στην καρδιά της Θεσσαλονίκης, δίπλα στην Πλατεία Δημοκρατίας. Πλήρως ανακαινισμένο το 2024 με πολυτελή υλικά και σύγχρονη αισθητική.";

// Helper to generate image paths based on ID (placeholders or real structure)
const getImages = (id: string) => [`/images/room-${id}-main.jpg`, `/images/room-${id}-bath.jpg`, `/images/room-${id}-view.jpg`];

export const INITIAL_PROPERTIES: Property[] = [
  // Ground Floor / Mezzanine
  {
    id: "t15-01",
    hosthubListingId: "0000001",
    title: "Urban Studio 01",
    titleEl: "Urban Studio 01",
    category: "Ground Floor",
    categoryEl: "Ισόγειο",
    shortDescription: "Compact and modern studio, perfect for solo travelers.",
    shortDescriptionEl: "Μοντέρνο και compact studio, ιδανικό για solo ταξιδιώτες.",
    description: `Studio 01. ${SHARED_DESC} Perfect for professionals and short getaways.`,
    descriptionEl: `Studio 01. ${SHARED_DESC_EL} Ιδανικό για επαγγελματίες και σύντομες αποδράσεις.`,
    images: getImages("01"),
    amenities: T15_AMENITIES,
    amenitiesEl: T15_AMENITIES_EL,
    capacity: 2, bedrooms: 0, bathrooms: 1,
    houseRules: T15_RULES,
    cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 65,
    cleaningFee: 20, climateCrisisTax: 1.5
  },
  {
    id: "t15-02",
    hosthubListingId: "0000002",
    title: "Urban Studio 02",
    titleEl: "Urban Studio 02",
    category: "Ground Floor",
    categoryEl: "Ισόγειο",
    shortDescription: "Stylish ground floor studio with easy access.",
    shortDescriptionEl: "Στυλάτο studio ισογείου με εύκολη πρόσβαση.",
    description: `Studio 02. ${SHARED_DESC} Comfort and functionality in a smartly designed space.`,
    descriptionEl: `Studio 02. ${SHARED_DESC_EL} Άνεση και λειτουργικότητα σε έναν έξυπνα σχεδιασμένο χώρο.`,
    images: getImages("02"),
    amenities: T15_AMENITIES,
    amenitiesEl: T15_AMENITIES_EL,
    capacity: 2, bedrooms: 0, bathrooms: 1,
    houseRules: T15_RULES,
    cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 65,
    cleaningFee: 20, climateCrisisTax: 1.5
  },

  // 1st Floor
  {
    id: "t15-101", hosthubListingId: "0000101", 
    title: "Executive Suite 101", titleEl: "Executive Σουίτα 101",
    category: "1st Floor", categoryEl: "1ος Όροφος",
    shortDescription: "Spacious suite with street view.", shortDescriptionEl: "Ευρύχωρη σουίτα με θέα στο δρόμο.",
    description: `Suite 101. ${SHARED_DESC}`, descriptionEl: `Σουίτα 101. ${SHARED_DESC_EL}`,
    images: getImages("101"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 3, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 85,
    cleaningFee: 30, climateCrisisTax: 1.5
  },
  {
    id: "t15-102", hosthubListingId: "0000102", 
    title: "Comfort Suite 102", titleEl: "Comfort Σουίτα 102",
    category: "1st Floor", categoryEl: "1ος Όροφος",
    shortDescription: "Quiet suite with modern amenities.", shortDescriptionEl: "Ήσυχη σουίτα με όλες τις σύγχρονες ανέσεις.",
    description: `Suite 102. ${SHARED_DESC}`, descriptionEl: `Σουίτα 102. ${SHARED_DESC_EL}`,
    images: getImages("102"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 3, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 80,
    cleaningFee: 30, climateCrisisTax: 1.5
  },
  {
    id: "t15-103", hosthubListingId: "0000103", 
    title: "Junior Suite 103", titleEl: "Junior Σουίτα 103",
    category: "1st Floor", categoryEl: "1ος Όροφος",
    shortDescription: "Cozy junior suite with balcony.", shortDescriptionEl: "Ζεστή junior σουίτα με μπαλκόνι.",
    description: `Suite 103. ${SHARED_DESC}`, descriptionEl: `Σουίτα 103. ${SHARED_DESC_EL}`,
    images: getImages("103"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 2, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 75,
    cleaningFee: 30, climateCrisisTax: 1.5
  },

  // 2nd Floor
  {
    id: "t15-201", hosthubListingId: "0000201", 
    title: "Executive Suite 201", titleEl: "Executive Σουίτα 201",
    category: "2nd Floor", categoryEl: "2ος Όροφος",
    shortDescription: "Elegant design and superior comfort.", shortDescriptionEl: "Κομψός σχεδιασμός και ανώτερη άνεση.",
    description: `Suite 201. ${SHARED_DESC}`, descriptionEl: `Σουίτα 201. ${SHARED_DESC_EL}`,
    images: getImages("201"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 4, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 90,
    cleaningFee: 35, climateCrisisTax: 1.5
  },
  {
    id: "t15-202", hosthubListingId: "0000202", 
    title: "Comfort Suite 202", titleEl: "Comfort Σουίτα 202",
    category: "2nd Floor", categoryEl: "2ος Όροφος",
    shortDescription: "Modern apartment for business or leisure.", shortDescriptionEl: "Μοντέρνο διαμέρισμα για δουλειά ή αναψυχή.",
    description: `Suite 202. ${SHARED_DESC}`, descriptionEl: `Σουίτα 202. ${SHARED_DESC_EL}`,
    images: getImages("202"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 3, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 85,
    cleaningFee: 35, climateCrisisTax: 1.5
  },
  {
    id: "t15-203", hosthubListingId: "0000203", 
    title: "Junior Suite 203", titleEl: "Junior Σουίτα 203",
    category: "2nd Floor", categoryEl: "2ος Όροφος",
    shortDescription: "Bright and airy junior suite.", shortDescriptionEl: "Φωτεινή και ευάερη junior σουίτα.",
    description: `Suite 203. ${SHARED_DESC}`, descriptionEl: `Σουίτα 203. ${SHARED_DESC_EL}`,
    images: getImages("203"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 2, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 80,
    cleaningFee: 35, climateCrisisTax: 1.5
  },

  // 3rd Floor
  {
    id: "t15-301", hosthubListingId: "0000301", 
    title: "Executive Suite 301", titleEl: "Executive Σουίτα 301",
    category: "3rd Floor", categoryEl: "3ος Όροφος",
    shortDescription: "Premium suite with city vibes.", shortDescriptionEl: "Premium σουίτα με αστική αύρα.",
    description: `Suite 301. ${SHARED_DESC}`, descriptionEl: `Σουίτα 301. ${SHARED_DESC_EL}`,
    images: getImages("301"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 4, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 95,
    cleaningFee: 35, climateCrisisTax: 1.5
  },
  {
    id: "t15-302", hosthubListingId: "0000302", 
    title: "Comfort Suite 302", titleEl: "Comfort Σουίτα 302",
    category: "3rd Floor", categoryEl: "3ος Όροφος",
    shortDescription: "Relaxing atmosphere in the city center.", shortDescriptionEl: "Χαλαρωτική ατμόσφαιρα στο κέντρο της πόλης.",
    description: `Suite 302. ${SHARED_DESC}`, descriptionEl: `Σουίτα 302. ${SHARED_DESC_EL}`,
    images: getImages("302"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 3, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 90,
    cleaningFee: 35, climateCrisisTax: 1.5
  },
  {
    id: "t15-303", hosthubListingId: "0000303", 
    title: "Junior Suite 303", titleEl: "Junior Σουίτα 303",
    category: "3rd Floor", categoryEl: "3ος Όροφος",
    shortDescription: "Perfect for couples.", shortDescriptionEl: "Ιδανικό για ζευγάρια.",
    description: `Suite 303. ${SHARED_DESC}`, descriptionEl: `Σουίτα 303. ${SHARED_DESC_EL}`,
    images: getImages("303"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 2, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 85,
    cleaningFee: 35, climateCrisisTax: 1.5
  },

  // 4th Floor
  {
    id: "t15-401", hosthubListingId: "0000401", 
    title: "Executive Suite 401", titleEl: "Executive Σουίτα 401",
    category: "4th Floor", categoryEl: "4ος Όροφος",
    shortDescription: "Luxurious stay with premium amenities.", shortDescriptionEl: "Πολυτελής διαμονή με premium παροχές.",
    description: `Suite 401. ${SHARED_DESC}`, descriptionEl: `Σουίτα 401. ${SHARED_DESC_EL}`,
    images: getImages("401"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 4, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 100,
    cleaningFee: 40, climateCrisisTax: 1.5
  },
  {
    id: "t15-402", hosthubListingId: "0000402", 
    title: "Comfort Suite 402", titleEl: "Comfort Σουίτα 402",
    category: "4th Floor", categoryEl: "4ος Όροφος",
    shortDescription: "Spacious and modern.", shortDescriptionEl: "Ευρύχωρο και μοντέρνο.",
    description: `Suite 402. ${SHARED_DESC}`, descriptionEl: `Σουίτα 402. ${SHARED_DESC_EL}`,
    images: getImages("402"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 3, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 95,
    cleaningFee: 40, climateCrisisTax: 1.5
  },
  {
    id: "t15-403", hosthubListingId: "0000403", 
    title: "Junior Suite 403", titleEl: "Junior Σουίτα 403",
    category: "4th Floor", categoryEl: "4ος Όροφος",
    shortDescription: "Charming suite with everything you need.", shortDescriptionEl: "Γοητευτική σουίτα με ό,τι χρειάζεστε.",
    description: `Suite 403. ${SHARED_DESC}`, descriptionEl: `Σουίτα 403. ${SHARED_DESC_EL}`,
    images: getImages("403"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 2, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 90,
    cleaningFee: 40, climateCrisisTax: 1.5
  },

  // 5th Floor
  {
    id: "t15-501", hosthubListingId: "0000501", 
    title: "Grand Suite 501", titleEl: "Grand Σουίτα 501",
    category: "5th Floor", categoryEl: "5ος Όροφος",
    shortDescription: "Extra spacious suite for families.", shortDescriptionEl: "Εξαιρετικά ευρύχωρη σουίτα για οικογένειες.",
    description: `Suite 501. ${SHARED_DESC}`, descriptionEl: `Σουίτα 501. ${SHARED_DESC_EL}`,
    images: getImages("501"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 4, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 110,
    cleaningFee: 50, climateCrisisTax: 1.5
  },
  {
    id: "t15-502", hosthubListingId: "0000502", 
    title: "Grand Suite 502", titleEl: "Grand Σουίτα 502",
    category: "5th Floor", categoryEl: "5ος Όροφος",
    shortDescription: "Panoramic views and luxury.", shortDescriptionEl: "Πανοραμική θέα και πολυτέλεια.",
    description: `Suite 502. ${SHARED_DESC}`, descriptionEl: `Σουίτα 502. ${SHARED_DESC_EL}`,
    images: getImages("502"), amenities: T15_AMENITIES, amenitiesEl: T15_AMENITIES_EL,
    capacity: 4, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES, cancellationPolicy: "Standard", location: "Thessaloniki Center", pricePerNightBase: 110,
    cleaningFee: 50, climateCrisisTax: 1.5
  },

  // 6th Floor
  {
    id: "t15-601",
    hosthubListingId: "0000601",
    title: "Penthouse Suite 601", titleEl: "Penthouse Σουίτα 601",
    category: "6th Floor", categoryEl: "6ος Όροφος",
    shortDescription: "Exclusive floor suite with large terrace.", shortDescriptionEl: "Αποκλειστική σουίτα ορόφου με μεγάλη βεράντα.",
    description: `Penthouse 601. ${SHARED_DESC} Enjoy privacy and luxury on the entire floor.`,
    descriptionEl: `Penthouse 601. ${SHARED_DESC_EL} Απολαύστε ιδιωτικότητα και πολυτέλεια σε ολόκληρο τον όροφο.`,
    images: getImages("601"),
    amenities: [...T15_AMENITIES, "Large Terrace", "City View"],
    amenitiesEl: [...T15_AMENITIES_EL, "Μεγάλη Βεράντα", "Θέα Πόλη"],
    capacity: 4, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES,
    cancellationPolicy: "Flexible", location: "Thessaloniki Center", pricePerNightBase: 140,
    cleaningFee: 60, climateCrisisTax: 3.0
  },

  // 7th Floor
  {
    id: "t15-701",
    hosthubListingId: "0000701",
    title: "King Penthouse 701", titleEl: "King Penthouse 701",
    category: "7th Floor", categoryEl: "7ος Όροφος",
    shortDescription: "Top floor luxury with breathtaking views.", shortDescriptionEl: "Πολυτέλεια τελευταίου ορόφου με θέα που κόβει την ανάσα.",
    description: `King Penthouse 701. ${SHARED_DESC} The ultimate stay experience at TOWER 15.`,
    descriptionEl: `King Penthouse 701. ${SHARED_DESC_EL} Η κορυφαία εμπειρία διαμονής στο TOWER 15.`,
    images: getImages("701"),
    amenities: [...T15_AMENITIES, "Panoramic View", "Private Balcony", "King Size Bed"],
    amenitiesEl: [...T15_AMENITIES_EL, "Πανοραμική Θέα", "Ιδιωτικό Μπαλκόνι", "Κρεβάτι King Size"],
    capacity: 2, bedrooms: 1, bathrooms: 1,
    houseRules: T15_RULES,
    cancellationPolicy: "Flexible", location: "Thessaloniki Center", pricePerNightBase: 160,
    cleaningFee: 70, climateCrisisTax: 3.0
  }
];

export const DEFAULT_BRAND_NAME = "TOWER 15 Suites";
