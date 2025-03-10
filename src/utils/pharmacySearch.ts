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
  
  // Enhanced global locations for worldwide coverage
  const internationalLocations = [
    // Major cities in North America
    { city: "new york", country: "USA", count: 4 },
    { city: "los angeles", country: "USA", count: 3 },
    { city: "chicago", country: "USA", count: 3 },
    { city: "toronto", country: "Canada", count: 3 },
    { city: "mexico city", country: "Mexico", count: 3 },
    { city: "vancouver", country: "Canada", count: 2 },
    { city: "montreal", country: "Canada", count: 2 },
    { city: "tampa", country: "USA", count: 3 },
    
    // Europe
    { city: "london", country: "UK", count: 3 },
    { city: "paris", country: "France", count: 3 },
    { city: "berlin", country: "Germany", count: 3 },
    { city: "rome", country: "Italy", count: 2 },
    { city: "madrid", country: "Spain", count: 2 },
    { city: "amsterdam", country: "Netherlands", count: 2 },
    { city: "zurich", country: "Switzerland", count: 2 },
    { city: "dublin", country: "Ireland", count: 2 },
    
    // Asia Pacific
    { city: "tokyo", country: "Japan", count: 3 },
    { city: "sydney", country: "Australia", count: 3 },
    { city: "singapore", country: "Singapore", count: 3 },
    { city: "mumbai", country: "India", count: 3 },
    { city: "beijing", country: "China", count: 3 },
    { city: "seoul", country: "South Korea", count: 2 },
    { city: "bangkok", country: "Thailand", count: 2 },
    { city: "auckland", country: "New Zealand", count: 2 },
    
    // Middle East & Africa
    { city: "dubai", country: "UAE", count: 3 },
    { city: "cape town", country: "South Africa", count: 2 },
    { city: "istanbul", country: "Turkey", count: 2 },
    { city: "tel aviv", country: "Israel", count: 2 },
    { city: "cairo", country: "Egypt", count: 2 },
    
    // South America
    { city: "rio de janeiro", country: "Brazil", count: 2 },
    { city: "sao paulo", country: "Brazil", count: 2 },
    { city: "buenos aires", country: "Argentina", count: 2 },
    { city: "lima", country: "Peru", count: 2 },
    { city: "santiago", country: "Chile", count: 2 }
  ];
  
  const normalizedLocation = location.toLowerCase().trim();
  
  // First check exact matches
  let matchedLocation = internationalLocations.find(loc => 
    normalizedLocation === loc.city.toLowerCase() || 
    normalizedLocation === loc.country.toLowerCase()
  );
  
  // If no exact match, try partial matches
  if (!matchedLocation) {
    matchedLocation = internationalLocations.find(loc => 
      normalizedLocation.includes(loc.city.toLowerCase()) || 
      loc.city.toLowerCase().includes(normalizedLocation) ||
      normalizedLocation.includes(loc.country.toLowerCase()) ||
      loc.country.toLowerCase().includes(normalizedLocation)
    );
  }
  
  // Special handling for common country abbreviations
  if (!matchedLocation) {
    const countryAbbreviations: {[key: string]: string} = {
      "us": "USA", "usa": "USA", "uk": "UK", "aus": "Australia", 
      "ca": "Canada", "jp": "Japan", "fr": "France", "de": "Germany",
      "it": "Italy", "es": "Spain", "mx": "Mexico", "br": "Brazil"
    };
    
    const expandedCountry = countryAbbreviations[normalizedLocation];
    if (expandedCountry) {
      matchedLocation = internationalLocations.find(loc => 
        loc.country.toLowerCase() === expandedCountry.toLowerCase()
      );
    }
  }
  
  if (matchedLocation) {
    console.log("Found international location match:", matchedLocation);
    return generateInternationalPharmacies(matchedLocation.city, matchedLocation.country, matchedLocation.count);
  }
  
  // If no specific match but looks international, generate some generic international results
  if (normalizedLocation.length > 0) {
    // For generic queries, return a diverse set of global results
    const randomLocations = internationalLocations
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    
    let results: Pharmacy[] = [];
    for (const loc of randomLocations) {
      results = results.concat(
        generateInternationalPharmacies(loc.city, loc.country, 1)
      );
    }
    
    return results;
  }
  
  return [];
};

// Generate mock international pharmacy data with more realistic details
const generateInternationalPharmacies = (city: string, country: string, count: number): Pharmacy[] => {
  const pharmacyChains: {[key: string]: string[]} = {
    // North America
    "USA": ["CVS Pharmacy", "Walgreens", "Rite Aid", "Walmart Pharmacy", "Target Pharmacy"],
    "Canada": ["Shoppers Drug Mart", "Rexall", "Jean Coutu", "London Drugs", "Pharmasave"],
    "Mexico": ["Farmacia San Pablo", "Farmacia Guadalajara", "Farmacias del Ahorro", "Farmacias Similares"],
    
    // Europe
    "UK": ["Boots", "Superdrug", "Lloyds Pharmacy", "Well Pharmacy", "Rowlands Pharmacy"],
    "France": ["Pharmacie Lafayette", "Pharmavance", "Pharmacie Monge", "Citypharma", "Pharmacie de la Place"],
    "Germany": ["Apotheke", "DocMorris", "Europa Apotheek", "Easy Apotheke", "Zur Rose"],
    "Italy": ["Farmacia Comunale", "Farmacia Igea", "Farmacia San Paolo", "Farmacia Internazionale"],
    "Spain": ["Farmacia Trébol", "Farmacia Cruz Verde", "Farmacia Internacional", "Farmacia Plaza Mayor"],
    "Netherlands": ["BENU Apotheek", "Mediq Apotheek", "Service Apotheek", "Alphega Apotheek"],
    "Switzerland": ["Amavita", "Sun Store", "Zur Rose", "TopPharm Apotheke", "Coop Vitality"],
    "Ireland": ["Boots Ireland", "McCabe's Pharmacy", "Allcare Pharmacy", "Life Pharmacy"],
    
    // Asia Pacific
    "Japan": ["Matsumoto Kiyoshi", "Welcia", "Tsuruha", "Kirindo", "Sugi Pharmacy"],
    "Australia": ["Chemist Warehouse", "Priceline Pharmacy", "Amcal", "TerryWhite Chemmart", "Blooms The Chemist"],
    "Singapore": ["Guardian", "Watsons", "Unity Pharmacy", "Caring Pharmacy", "NHG Pharmacy"],
    "India": ["Apollo Pharmacy", "MedPlus", "Netmeds", "PharmEasy", "1mg"],
    "China": ["Nepstar", "Jointown Pharmaceutical", "Yifeng Pharmacy", "Dashenlin Pharmacy"],
    "South Korea": ["Olive Young", "GS Watsons", "Emart Pharmacy", "Lotte Pharmacy"],
    "Thailand": ["Boots Thailand", "Watsons Thailand", "Fascino", "P&F Pharmacy"],
    "New Zealand": ["Unichem", "Life Pharmacy", "Countdown Pharmacy", "Green Cross Health"],
    
    // Middle East & Africa
    "UAE": ["Life Pharmacy", "Aster Pharmacy", "BinSina", "Boots UAE", "Super Care Pharmacy"],
    "South Africa": ["Clicks Pharmacy", "Dis-Chem", "MediRite", "Link Pharmacy", "Alpha Pharm"],
    "Turkey": ["Eczane", "Bayer Eczanesi", "Akgün Eczanesi", "Hayat Eczanesi"],
    "Israel": ["Super-Pharm", "New Pharm", "Be Pharm", "Good Pharm"],
    "Egypt": ["El Ezaby Pharmacy", "19011 Pharmacy", "Seif Pharmacy", "Pharmacy 19"],
    
    // South America
    "Brazil": ["Drogaria São Paulo", "Drogasil", "Pague Menos", "Pacheco", "Onofre"],
    "Argentina": ["Farmacity", "Farmacia Líder", "Dr. Ahorro", "Vantage", "Farmacia Modelo"],
    "Peru": ["InkaFarma", "Mifarma", "Boticas Arcángel", "Boticas Fasa"],
    "Chile": ["Farmacias Ahumada", "Cruz Verde", "Salcobrand", "Dr. Simi"],
    
    // Fallback for other countries
    "International": ["Global Pharmacy", "International Drugs", "World Pharma", "Universal Pharmacy", "MediGlobal"]
  };
  
  const chains = pharmacyChains[country] || pharmacyChains["International"];
  const formatted = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  
  // Street name templates to make addresses more authentic
  const streetTemplates = {
    "USA": ["Main St", "Broadway", "5th Ave", "Market St", "Oak St", "Washington Ave"], 
    "UK": ["High St", "Station Rd", "London Rd", "Church St", "Victoria Rd", "Queen St"],
    "France": ["Rue de Paris", "Avenue des Champs-Élysées", "Boulevard Saint-Michel", "Rue de Rivoli"],
    "Germany": ["Hauptstraße", "Bahnhofstraße", "Schulstraße", "Kirchstraße", "Gartenstraße"],
    "Japan": ["Sakura-dori", "Ginza", "Shinjuku-dori", "Omotesando"],
    "default": ["Main St", "Central Ave", "Park Rd", "Market St", "Station Rd", "Hospital Rd", "University Ave"]
  };
  
  const streets = streetTemplates[country] || streetTemplates["default"];
  
  // Generate pharmacy ratings that are likely to be good but realistic (3.5-5.0)
  return Array.from({ length: count }, (_, i) => {
    const chainName = chains[i % chains.length];
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    const streetName = streets[Math.floor(Math.random() * streets.length)];
    const rating = (3.5 + Math.random() * 1.5);
    
    return {
      id: 1000 + Math.floor(Math.random() * 9000),
      name: chainName,
      address: `${streetNumber} ${streetName}, ${formatted}, ${country}`,
      phone: `+${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      hours: Math.random() > 0.5 ? "24 hours" : "8am - 10pm",
      distance: "International",
      rating: rating,
      chain: chainName,
      zipCode: `INT-${Math.floor(Math.random() * 9000) + 1000}`,
      city: formatted,
      state: country
    };
  });
};

// Enhanced AI-powered universal search function with language support
export const intelligentPharmacySearch = (query: string, language: string = 'en'): Pharmacy[] => {
  if (!query) return [];
  
  console.log(`AI-enhanced search for: "${query}" in language: ${language}`);
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
    : [...cityResults, ...zipResults.filter(zip => !cityResults.some(city => zip.id === city.id))];
  
  // If no results, try a more permissive search as a fallback
  if (combinedResults.length === 0) {
    combinedResults = pharmacies.filter(pharmacy => 
      pharmacy.name.toLowerCase().includes(normalizedQuery) ||
      pharmacy.address.toLowerCase().includes(normalizedQuery) ||
      pharmacy.chain.toLowerCase().includes(normalizedQuery)
    );
    
    // If still no results, add some global results
    if (combinedResults.length === 0) {
      combinedResults = getInternationalPharmacies(normalizedQuery);
    }
  }
  
  console.log("Total results after AI search:", combinedResults.length);
  
  // Sort by rating unless it's a zip code search (where distance matters more)
  if (!isZipCode) {
    combinedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  
  return combinedResults;
};
