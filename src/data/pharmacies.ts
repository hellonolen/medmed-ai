
// Mock pharmacy data with nationwide coverage
export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  distance: string;
  rating: number;
  chain: string;
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
    chain: "CVS"
  },
  {
    id: 2,
    name: "CVS Pharmacy",
    address: "456 Broadway, Chicago, IL 60601",
    phone: "(312) 555-5678",
    hours: "8am - 10pm",
    distance: "0.8 miles",
    rating: 4.3,
    chain: "CVS"
  },
  // Walgreens Locations
  {
    id: 3,
    name: "Walgreens",
    address: "789 Oak Ave, Los Angeles, CA 90001",
    phone: "(323) 555-9012",
    hours: "24 hours",
    distance: "1.2 miles",
    rating: 4.4,
    chain: "Walgreens"
  },
  {
    id: 4,
    name: "Walgreens",
    address: "321 Pine St, Miami, FL 33101",
    phone: "(305) 555-3456",
    hours: "7am - 11pm",
    distance: "1.5 miles",
    rating: 4.6,
    chain: "Walgreens"
  },
  // Independent Pharmacies
  {
    id: 5,
    name: "Community Care Pharmacy",
    address: "567 Elm St, Boston, MA 02101",
    phone: "(617) 555-7890",
    hours: "9am - 8pm",
    distance: "0.6 miles",
    rating: 4.8,
    chain: "Independent"
  },
  {
    id: 6,
    name: "Metro Health Pharmacy",
    address: "890 Market St, San Francisco, CA 94102",
    phone: "(415) 555-4321",
    hours: "8am - 9pm",
    distance: "0.9 miles",
    rating: 4.7,
    chain: "Independent"
  }
];
