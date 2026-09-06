/**
 * Central Brand & Loft Configuration
 * ===================================
 * Update your farm details, contact numbers, social media links, and location
 * in this single file to update them across the entire application instantly.
 */

export const SITE_CONFIG = {
  // Brand & Farm Identity
  farmName: "Himel Agro",
  shortName: "Himel Agro",
  loftSubtitle: "Himel Agro Pigeon Farm & Performance Genetics",
  ownerName: "Himel",
  establishedYear: 2024,
  location: "Dhaka, Bangladesh",
  logoUrl: "/logo.png",

  // Contact Numbers
  contactNumber: "01560059954",
  whatsappNumber: "01560059954",

  // Direct Action & Social URLs
  telUrl: "tel:01560059954",
  whatsappUrl: "https://wa.me/8801560059954",
  facebookUrl: "https://www.facebook.com/Himel.Pet.House",
  googleMapUrl: "https://maps.app.goo.gl/rxvdsxq8ydnqfEKQ6",

  // Currency & Formatting
  currency: "BDT",
  currencySymbol: "৳",
} as const;

export type SiteConfig = typeof SITE_CONFIG;
