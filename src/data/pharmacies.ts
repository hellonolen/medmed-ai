
// Mock pharmacy data with nationwide coverage and ZIP codes
export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  distance: string;
  rating: number;
  chain: string;
  zipCode: string; // Added ZIP code
  city: string; // Added city
  state: string; // Added state
}

export const pharmacies: Pharmacy[] = [
  // CVS Locations
  {
    id: 1,
    name: "CVS Pharmacy",
    address: "123 Main St, New York, NY 10001",
    phone: "(212) 555-1234",
    hours: "24 hours",
    distance: "0.3 miles",
    rating: 4.5,
    chain: "CVS",
    zipCode: "10001",
    city: "New York",
    state: "NY"
  },
  {
    id: 2,
    name: "CVS Pharmacy",
    address: "456 Broadway, Chicago, IL 60601",
    phone: "(312) 555-5678",
    hours: "8am - 10pm",
    distance: "0.8 miles",
    rating: 4.3,
    chain: "CVS",
    zipCode: "60601",
    city: "Chicago",
    state: "IL"
  },
  {
    id: 3,
    name: "CVS Pharmacy",
    address: "789 Joliet Rd, Joliet, IL 60432",
    phone: "(815) 555-9012",
    hours: "7am - 10pm",
    distance: "0.5 miles",
    rating: 4.2,
    chain: "CVS",
    zipCode: "60432",
    city: "Joliet",
    state: "IL"
  },
  {
    id: 10,
    name: "CVS Pharmacy",
    address: "1001 Boyette Rd, Tampa, FL 33511",
    phone: "(813) 555-7890",
    hours: "8am - 10pm",
    distance: "1.2 miles",
    rating: 4.1,
    chain: "CVS",
    zipCode: "33511",
    city: "Tampa",
    state: "FL"
  },
  // Walgreens Locations
  {
    id: 4,
    name: "Walgreens",
    address: "789 Oak Ave, Los Angeles, CA 90001",
    phone: "(323) 555-9012",
    hours: "24 hours",
    distance: "1.2 miles",
    rating: 4.4,
    chain: "Walgreens",
    zipCode: "90001",
    city: "Los Angeles",
    state: "CA"
  },
  {
    id: 5,
    name: "Walgreens",
    address: "321 Pine St, Miami, FL 33101",
    phone: "(305) 555-3456",
    hours: "7am - 11pm",
    distance: "1.5 miles",
    rating: 4.6,
    chain: "Walgreens",
    zipCode: "33101",
    city: "Miami",
    state: "FL"
  },
  {
    id: 6,
    name: "Walgreens",
    address: "543 Ruby St, Joliet, IL 60432",
    phone: "(815) 555-7890",
    hours: "8am - 10pm",
    distance: "0.7 miles",
    rating: 4.5,
    chain: "Walgreens",
    zipCode: "60432",
    city: "Joliet",
    state: "IL"
  },
  {
    id: 11,
    name: "Walgreens",
    address: "555 Dale Mabry Hwy, Tampa, FL 33609",
    phone: "(813) 555-1212",
    hours: "24 hours",
    distance: "0.9 miles",
    rating: 4.3,
    chain: "Walgreens",
    zipCode: "33609",
    city: "Tampa",
    state: "FL"
  },
  {
    id: 12,
    name: "Walgreens",
    address: "123 Michigan Ave, Chicago, IL 60603",
    phone: "(312) 555-9999",
    hours: "7am - 10pm",
    distance: "0.4 miles",
    rating: 4.7,
    chain: "Walgreens",
    zipCode: "60603",
    city: "Chicago",
    state: "IL"
  },
  // Independent Pharmacies
  {
    id: 7,
    name: "Community Care Pharmacy",
    address: "567 Elm St, Boston, MA 02101",
    phone: "(617) 555-7890",
    hours: "9am - 8pm",
    distance: "0.6 miles",
    rating: 4.8,
    chain: "Independent",
    zipCode: "02101",
    city: "Boston",
    state: "MA"
  },
  {
    id: 8,
    name: "Metro Health Pharmacy",
    address: "890 Market St, San Francisco, CA 94102",
    phone: "(415) 555-4321",
    hours: "8am - 9pm",
    distance: "0.9 miles",
    rating: 4.7,
    chain: "Independent",
    zipCode: "94102",
    city: "San Francisco",
    state: "CA"
  },
  {
    id: 9,
    name: "Hometown Pharmacy",
    address: "432 Main St, Joliet, IL 60432",
    phone: "(815) 555-6543",
    hours: "9am - 7pm",
    distance: "0.4 miles",
    rating: 4.9,
    chain: "Independent",
    zipCode: "60432",
    city: "Joliet",
    state: "IL"
  },
  {
    id: 13,
    name: "Tampa Bay Pharmacy",
    address: "789 Tampa Bay Blvd, Tampa, FL 33614",
    phone: "(813) 555-8765",
    hours: "8am - 8pm",
    distance: "1.1 miles",
    rating: 4.9,
    chain: "Independent",
    zipCode: "33614",
    city: "Tampa",
    state: "FL"
  },
  {
    id: 14,
    name: "Windy City Pharmacy",
    address: "456 State St, Chicago, IL 60605",
    phone: "(312) 555-4444",
    hours: "8am - 7pm",
    distance: "0.7 miles",
    rating: 4.8,
    chain: "Independent",
    zipCode: "60605",
    city: "Chicago",
    state: "IL"
  }
];
