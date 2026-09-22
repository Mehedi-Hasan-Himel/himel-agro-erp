export interface FarmSettings {
  farmName: string;
  currency: string;
  currencySymbol: string;
  contactNumber: string;
  whatsappNumber?: string;
  ownerName: string;
  establishedYear: number;
  location: string;
  facebookUrl?: string;
  googleMapUrl?: string;
  logoUrl?: string;
  notes?: string;
  googleSheetsUrl?: string;
  googleSheetsAutoSync?: boolean;
  googleSheetsIntervalMinutes?: number;
  lastGoogleSheetSync?: string;
}
