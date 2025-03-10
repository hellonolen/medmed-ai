
import { Pharmacy, pharmacies } from "@/data/pharmacies";

// Calculate a realistic distance based on ZIP code or location comparison
const calculateDistance = (zipCode1: string, zipCode2: string): string => {
  // In a real app, we would use geocoding APIs to calculate actual distances
  // For the demo, we'll generate a somewhat consistent distance based on ZIP code similarity
  
  // If the ZIP codes match exactly, it's very close
  if (zipCode1 === zipCode2) {
    return (Math.random() * 1.5).toFixed(1) + ' miles';
  }
  
  // If the first 3 digits match (same general area), it's relatively close
  if (zipCode1.substring(0, 3) === zipCode2.substring(0, 3)) {
    return (1.5 + Math.random() * 3).toFixed(1) + ' miles';
  }
  
  // Otherwise, it's further away
  return (5 + Math.random() * 15).toFixed(1) + ' miles';
};

// Enhanced search with fuzzy matching and AI-like capabilities
export const searchPharmaciesByZip = (zipCode: string): Pharmacy[] => {
  if (!zipCode) return [];
  
  console.log("Searching ZIP code:", zipCode);
  
  // Normalize input
  const normalizedZip = zipCode.trim();
  
  // Try exact match first
  let matchedPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.zipCode === normalizedZip
  );
  
  // If no results, try prefix match (more forgiving)
  if (matchedPharmacies.length === 0 && normalizedZip.length >= 2) {
    matchedPharmacies = pharmacies.filter(pharmacy => 
      pharmacy.zipCode.startsWith(normalizedZip)
    );
  }
  
  // If still no results and looking like a non-US postal code format, try international match
  if (matchedPharmacies.length === 0 && (normalizedZip.length !== 5 || /[a-zA-Z]/.test(normalizedZip))) {
    // For demo purposes, return some pharmacies to simulate international results
    matchedPharmacies = getInternationalPharmacies(normalizedZip);
  }
  
  console.log("Found pharmacies:", matchedPharmacies.length);
  
  // Calculate distances
  return matchedPharmacies.map(pharmacy => ({
    ...pharmacy,
    distance: calculateDistance(normalizedZip, pharmacy.zipCode)
  }));
};

export const searchPharmaciesByCity = (city: string): Pharmacy[] => {
  if (!city) return [];
  
  console.log("Searching city:", city);
  
  // Normalize input for better matching
  const searchTerm = city.toLowerCase().trim();
  
  // First try exact match with city names
  let matchedPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.city.toLowerCase() === searchTerm
  );
  
  // If no exact matches, try partial match
  if (matchedPharmacies.length === 0) {
    matchedPharmacies = pharmacies.filter(pharmacy => 
      pharmacy.city.toLowerCase().includes(searchTerm) || 
      searchTerm.includes(pharmacy.city.toLowerCase())
    );
  }
  
  // If still no matches, try matching state
  if (matchedPharmacies.length === 0) {
    matchedPharmacies = pharmacies.filter(pharmacy => 
      pharmacy.state.toLowerCase() === searchTerm || 
      pharmacy.state.toLowerCase().includes(searchTerm)
    );
  }
  
  // If still no results, check if it might be an international location
  if (matchedPharmacies.length === 0) {
    // For demo purposes, return some pharmacies to simulate international results
    matchedPharmacies = getInternationalPharmacies(city);
  }
  
  console.log("Found pharmacies:", matchedPharmacies.length);
  console.log("Available cities in data:", [...new Set(pharmacies.map(p => p.city))]);
  
  // Return pharmacies with calculated distances
  return matchedPharmacies.map(pharmacy => ({
    ...pharmacy,
    distance: (1 + Math.random() * 5).toFixed(1) + ' miles'
  }));
};

// Function to simulate international pharmacy search
// In a real app, this would connect to an API like Google Places or a global pharmacy database
const getInternationalPharmacies = (location: string): Pharmacy[] => {
  console.log("Simulating international search for:", location);
  
  // Common international cities for demo purposes
  const internationalLocations = [
    { city: "london", country: "UK", count: 3 },
    { city: "paris", country: "France", count: 2 },
    { city: "berlin", country: "Germany", count: 2 },
    { city: "tokyo", country: "Japan", count: 3 },
    { city: "sydney", country: "Australia", count: 2 },
    { city: "toronto", country: "Canada", count: 2 },
    { city: "mexico city", country: "Mexico", count: 2 },
    { city: "sao paulo", country: "Brazil", count: 2 },
    { city: "mumbai", country: "India", count: 3 },
    { city: "dubai", country: "UAE", count: 2 }
  ];
  
  const normalizedLocation = location.toLowerCase().trim();
  
  // Check if location matches any international city
  const matchedLocation = internationalLocations.find(loc => 
    normalizedLocation.includes(loc.city) || 
    loc.city.includes(normalizedLocation) ||
    normalizedLocation.includes(loc.country.toLowerCase())
  );
  
  if (matchedLocation) {
    console.log("Found international location match:", matchedLocation);
    return generateInternationalPharmacies(matchedLocation.city, matchedLocation.country, matchedLocation.count);
  }
  
  // If no specific match but looks international, generate some generic international results
  if (normalizedLocation.length > 0) {
    return generateInternationalPharmacies(normalizedLocation, "International", 2);
  }
  
  return [];
};

// Generate mock international pharmacy data
const generateInternationalPharmacies = (city: string, country: string, count: number): Pharmacy[] => {
  const pharmacyChains = {
    "UK": ["Boots", "Superdrug", "Lloyds Pharmacy"],
    "France": ["Pharmacie Lafayette", "Pharmavance", "Pharmacie Monge"],
    "Germany": ["Apotheke", "DocMorris", "Europa Apotheek"],
    "Japan": ["Matsumoto Kiyoshi", "Welcia", "Tsuruha"],
    "Australia": ["Chemist Warehouse", "Priceline Pharmacy", "Amcal"],
    "Canada": ["Shoppers Drug Mart", "Rexall", "Jean Coutu"],
    "Mexico": ["Farmacia San Pablo", "Farmacia Guadalajara", "Farmacias del Ahorro"],
    "Brazil": ["Drogaria São Paulo", "Drogasil", "Pague Menos"],
    "India": ["Apollo Pharmacy", "MedPlus", "Netmeds"],
    "UAE": ["Life Pharmacy", "Aster Pharmacy", "BinSina"],
    "International": ["Global Pharmacy", "International Drugs", "World Pharma"]
  };
  
  const chains = pharmacyChains[country] || pharmacyChains["International"];
  
  return Array.from({ length: count }, (_, i) => {
    const chainName = chains[i % chains.length];
    const formatted = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    
    return {
      id: 1000 + Math.floor(Math.random() * 9000),
      name: chainName,
      address: `${Math.floor(Math.random() * 200) + 1} ${formatted} St, ${formatted}, ${country}`,
      phone: `+${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      hours: Math.random() > 0.5 ? "24 hours" : "8am - 10pm",
      distance: "International",
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      chain: chainName,
      zipCode: `INT-${Math.floor(Math.random() * 9000) + 1000}`,
      city: formatted,
      state: country
    };
  });
};

// AI-enhanced universal search function that can detect what the user is looking for
export const intelligentPharmacySearch = (query: string): Pharmacy[] => {
  if (!query) return [];
  
  console.log("AI-enhanced search for:", query);
  const normalizedQuery = query.toLowerCase().trim();
  
  // Try to determine if the query is a ZIP code or a city name
  const isZipCode = /^\d{5}(-\d{4})?$/.test(normalizedQuery) || // US format
                   /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(normalizedQuery) || // Canadian format
                   /^[A-Za-z]{1,2}\d{1,2}[A-Za-z]? ?\d[A-Za-z]{2}$/.test(normalizedQuery); // UK format
  
  // Get results from both search methods
  const zipResults = searchPharmaciesByZip(normalizedQuery);
  const cityResults = searchPharmaciesByCity(normalizedQuery);
  
  // Combine and deduplicate results, prioritizing the more likely search type
  let combinedResults = isZipCode 
    ? [...zipResults, ...cityResults.filter(city => !zipResults.some(zip => zip.id === city.id))]
    : [...cityResults, ...zipResults.filter(zip => !cityResults.some(city => city.id === zip.id))];
  
  // If no results, try a more permissive search as a fallback
  if (combinedResults.length === 0) {
    combinedResults = pharmacies.filter(pharmacy => 
      pharmacy.name.toLowerCase().includes(normalizedQuery) ||
      pharmacy.address.toLowerCase().includes(normalizedQuery) ||
      pharmacy.chain.toLowerCase().includes(normalizedQuery)
    );
  }
  
  console.log("Total results after AI search:", combinedResults.length);
  return combinedResults;
};
