export interface Property {
  id: string;
  hosthubListingId: string;
  title: string;
  titleEl?: string; // Greek Title
  category: string;
  categoryEl?: string; // Greek Category
  description: string;
  descriptionEl?: string; // Greek Description
  shortDescription: string;
  shortDescriptionEl?: string; // Greek Short Description
  images: string[];
  amenities: string[];
  amenitiesEl?: string[]; // Greek Amenities
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  houseRules: string[];
  cancellationPolicy: string;
  location: string;
  pricePerNightBase: number;
  cleaningFee: number;
  climateCrisisTax: number;
}

export interface BookingRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  guestName: string;
  guestEmail: string;
}

export interface HosthubAvailability {
  date: string;
  available: boolean;
  price: number;
  minStay: number;
}

export interface CMSState {
  properties: Property[];
  brandName: string;
  stripePublicKey: string;
  hosthubApiKey: string;
  mydataUserId?: string;
  mydataApiKey?: string;
  vatNumber?: string;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED'
}

export interface RealBooking {
  id: string;
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: BookingStatus;
  guestEmail: string;
  createdAt: string;
  transactionId?: string;
}
