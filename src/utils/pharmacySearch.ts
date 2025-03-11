// Enhanced search utilities for pharmacy and med spa locations

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

// Helper function to clean search terms and remove language codes
const cleanSearchTerm = (searchTerm: string): string => {
  // Remove language codes like (en), (es), etc.
  return searchTerm.replace(/\s*\([a-z]{2}\)\s*/g, "").trim();
};

// Enhanced search with fuzzy matching and AI-like capabilities
export const searchPharmaciesByZip = (zipCode: string): Pharmacy[] => {
  if (!zipCode) return [];
  
  // Clean the zip code by removing language codes
  const cleanedZip = cleanSearchTerm(zipCode);
  console.log("Searching ZIP code:", cleanedZip);
  
  // Extract just the ZIP code if it's part of a larger string
  let normalizedZip = cleanedZip.trim();
  
  // Check for ZIP code pattern in the string (5 digits for US)
  const zipMatch = normalizedZip.match(/\b\d{5}\b/);
  if (zipMatch) {
    normalizedZip = zipMatch[0];
  }
  
  console.log("Normalized ZIP:", normalizedZip);
  
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
  
  // If still no results, try matching any part of the ZIP
  if (matchedPharmacies.length === 0 && normalizedZip.length >= 2) {
    matchedPharmacies = pharmacies.filter(pharmacy => 
      pharmacy.zipCode.includes(normalizedZip)
    );
  }
  
  // If still no results and looking like a non-US postal code format, try international match
  if (matchedPharmacies.length === 0 && (normalizedZip.length !== 5 || /[a-zA-Z]/.test(normalizedZip))) {
    // For demo purposes, return some pharmacies to simulate international results
    matchedPharmacies = getInternationalPharmacies(normalizedZip);
  }
  
  console.log("Found pharmacies by ZIP:", matchedPharmacies.length);
  
  // Calculate distances
  return matchedPharmacies.map(pharmacy => ({
    ...pharmacy,
    distance: calculateDistance(normalizedZip, pharmacy.zipCode)
  }));
};

export const searchPharmaciesByCity = (city: string): Pharmacy[] => {
  if (!city) return [];
  
  // Clean the city name by removing language codes
  const cleanedCity = cleanSearchTerm(city);
  console.log("Searching city:", cleanedCity);
  
  // Normalize input for better matching
  const searchTerm = cleanedCity.toLowerCase().trim();
  
  console.log("Normalized city search term:", searchTerm);
  
  // US cities to prioritize
  const usCities = {
    "alpharetta": "Alpharetta, GA",
    "atlanta": "Atlanta, GA",
    "tampa": "Tampa, FL",
    "ny": "New York, NY",
    "nyc": "New York, NY",
    "la": "Los Angeles, CA",
    "chicago": "Chicago, IL",
    "miami": "Miami, FL",
    "boston": "Boston, MA",
    "sf": "San Francisco, CA",
    "san francisco": "San Francisco, CA",
    "dallas": "Dallas, TX",
    "houston": "Houston, TX",
    "phoenix": "Phoenix, AZ",
    "philadelphia": "Philadelphia, PA",
    "seattle": "Seattle, WA",
    "denver": "Denver, CO",
    "austin": "Austin, TX",
    "nashville": "Nashville, TN",
    "portland": "Portland, OR",
    "las vegas": "Las Vegas, NV",
    "vegas": "Las Vegas, NV",
    "charlotte": "Charlotte, NC",
    "san diego": "San Diego, CA",
    "orlando": "Orlando, FL",
    "minneapolis": "Minneapolis, MN",
    "new orleans": "New Orleans, LA"
  };
  
  // Check if this is a known US city
  if (searchTerm in usCities) {
    // Generate realistic US-based pharmacies and med spas for this city
    return generateUSCityPharmacies(usCities[searchTerm as keyof typeof usCities]);
  }
  
  // First try exact match with city names
  let matchedPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.city.toLowerCase() === searchTerm
  );
  
  // If no exact matches, try partial match with city names
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
  
  // Special handling for common city names
  if (matchedPharmacies.length === 0) {
    // Map of common search terms to city names
    const cityAliases: {[key: string]: string} = {
      "tampa": "Tampa",
      "ny": "New York",
      "nyc": "New York",
      "la": "Los Angeles",
      "chicago": "Chicago",
      "miami": "Miami",
      "boston": "Boston",
      "sf": "San Francisco",
      "san francisco": "San Francisco"
    };
    
    const mappedCity = cityAliases[searchTerm];
    if (mappedCity) {
      matchedPharmacies = pharmacies.filter(pharmacy => 
        pharmacy.city === mappedCity
      );
    }
  }
  
  // If still no results, check if it might be an international location
  if (matchedPharmacies.length === 0) {
    // For demo purposes, return some pharmacies to simulate international results
    matchedPharmacies = getInternationalPharmacies(searchTerm);
  }
  
  console.log("Found pharmacies by city:", matchedPharmacies.length);
  console.log("Available cities in data:", [...new Set(pharmacies.map(p => p.city))]);
  
  // Return pharmacies with calculated distances
  return matchedPharmacies.map(pharmacy => ({
    ...pharmacy,
    distance: (1 + Math.random() * 5).toFixed(1) + ' miles'
  }));
};

// Search by phone number
export const searchPharmaciesByPhone = (phone: string): Pharmacy[] => {
  if (!phone) return [];
  
  // Clean and normalize phone number (remove all non-digit characters)
  const normalizedPhone = phone.replace(/\D/g, '');
  console.log("Searching by phone:", normalizedPhone);
  
  if (normalizedPhone.length < 7) {
    return []; // Too short to be a valid phone number
  }
  
  // Try to match by phone number
  let matchedPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.phone.replace(/\D/g, '').includes(normalizedPhone)
  );
  
  // If no results, generate some plausible results with the phone number
  if (matchedPharmacies.length === 0) {
    // Generate some mock results since we don't have real phone data
    matchedPharmacies = generatePhoneSearchResults(normalizedPhone);
  }
  
  return matchedPharmacies;
};

// Search by facility name
export const searchPharmaciesByName = (name: string): Pharmacy[] => {
  if (!name) return [];
  
  const cleanedName = cleanSearchTerm(name);
  const normalizedName = cleanedName.toLowerCase().trim();
  console.log("Searching by name:", normalizedName);
  
  // Try to match by name
  let matchedPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.name.toLowerCase().includes(normalizedName)
  );
  
  // Also try to match by chain
  const chainMatches = pharmacies.filter(pharmacy => 
    pharmacy.chain && pharmacy.chain.toLowerCase().includes(normalizedName)
  );
  
  // Combine results without duplicates
  chainMatches.forEach(pharmacy => {
    if (!matchedPharmacies.some(p => p.id === pharmacy.id)) {
      matchedPharmacies.push(pharmacy);
    }
  });
  
  // If no results, check for med spa specific terms
  if (matchedPharmacies.length === 0 && (
    normalizedName.includes("spa") || 
    normalizedName.includes("med") || 
    normalizedName.includes("aesthetic") ||
    normalizedName.includes("beauty") ||
    normalizedName.includes("cosmetic") ||
    normalizedName.includes("wellness")
  )) {
    // Generate med spa specific results
    matchedPharmacies = generateMedSpaResults(normalizedName);
  }
  
  return matchedPharmacies.map(pharmacy => ({
    ...pharmacy,
    distance: "Varies by location"
  }));
};

// Generate mock phone search results
const generatePhoneSearchResults = (phoneNumber: string): Pharmacy[] => {
  console.log("Generating phone search results for:", phoneNumber);
  
  // Determine facility type based on last 4 digits
  const lastFour = phoneNumber.slice(-4);
  const digitSum = lastFour.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  
  let facilityType = "Pharmacy";
  if (digitSum % 3 === 0) {
    facilityType = "Med Spa";
  } else if (digitSum % 3 === 1) {
    facilityType = "Wellness Center";
  }
  
  // Generate a city based on area code or first 3 digits
  const areaCode = phoneNumber.slice(0, 3);
  let city = "New York";
  let state = "NY";
  
  // Simple mapping of some area codes to locations
  const areaCodes: {[key: string]: {city: string, state: string}} = {
    "212": {city: "New York", state: "NY"},
    "213": {city: "Los Angeles", state: "CA"},
    "305": {city: "Miami", state: "FL"},
    "312": {city: "Chicago", state: "IL"},
    "404": {city: "Atlanta", state: "GA"},
    "415": {city: "San Francisco", state: "CA"},
    "617": {city: "Boston", state: "MA"},
    "713": {city: "Houston", state: "TX"},
    "214": {city: "Dallas", state: "TX"},
    "702": {city: "Las Vegas", state: "NV"},
    "303": {city: "Denver", state: "CO"},
    "615": {city: "Nashville", state: "TN"},
    "503": {city: "Portland", state: "OR"},
    "206": {city: "Seattle", state: "WA"}
  };
  
  if (areaCode in areaCodes) {
    city = areaCodes[areaCode].city;
    state = areaCodes[areaCode].state;
  }
  
  // Generate a facility name
  const facilityNames = {
    "Pharmacy": ["Quick Care Pharmacy", "Health Essentials Pharmacy", "Community Rx", "Wellness Pharmacy", "Total Care Rx"],
    "Med Spa": ["Rejuvenate Med Spa", "Glow Aesthetics", "Elite Med Spa", "Radiance Beauty Clinic", "Refresh Wellness Spa"],
    "Wellness Center": ["Vitality Wellness", "Optimal Health Center", "Balance Wellness", "Harmony Health", "Serenity Wellness"]
  };
  
  const name = facilityNames[facilityType as keyof typeof facilityNames][Math.floor(Math.random() * 5)];
  
  // Format phone with proper formatting
  const formattedPhone = `+1 ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
  
  return [{
    id: parseInt(lastFour) + 5000,
    name: name,
    address: `${Math.floor(Math.random() * 1000) + 100} Main St, ${city}, ${state}`,
    phone: formattedPhone,
    hours: Math.random() > 0.5 ? "8am - 8pm" : "9am - 7pm",
    distance: "Found by phone",
    rating: 3.5 + Math.random() * 1.5,
    chain: name,
    zipCode: "10001",
    city: city,
    state: state
  }];
};

// Generate med spa specific results
const generateMedSpaResults = (searchTerm: string): Pharmacy[] => {
  console.log("Generating med spa results for:", searchTerm);
  
  // Med spa chains
  const medSpaChains = [
    "Ideal Image Med Spa",
    "LaserAway",
    "Pure Med Spa",
    "Massage Envy",
    "Hand & Stone Massage and Facial Spa",
    "European Wax Center",
    "Botanica Day Spa"
  ];
  
  // Match search term with med spa chains
  const matchingChains = medSpaChains.filter(chain => 
    chain.toLowerCase().includes(searchTerm)
  );
  
  // Use matching chains if found, otherwise pick random ones
  const chainsToUse = matchingChains.length > 0 ? 
    matchingChains : 
    medSpaChains.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  // US Cities with higher med spa density
  const popularCities = [
    {city: "Los Angeles", state: "CA"},
    {city: "New York", state: "NY"},
    {city: "Miami", state: "FL"},
    {city: "Dallas", state: "TX"},
    {city: "Houston", state: "TX"},
    {city: "Chicago", state: "IL"},
    {city: "Las Vegas", state: "NV"},
    {city: "Phoenix", state: "AZ"},
    {city: "San Diego", state: "CA"},
    {city: "Atlanta", state: "GA"},
    {city: "Denver", state: "CO"},
    {city: "Scottsdale", state: "AZ"},
    {city: "Beverly Hills", state: "CA"},
    {city: "Newport Beach", state: "CA"}
  ];
  
  // Generate 3-5 med spas
  const count = Math.min(chainsToUse.length, 5);
  
  return Array.from({ length: count }, (_, i) => {
    const location = popularCities[Math.floor(Math.random() * popularCities.length)];
    const streetNumber = Math.floor(Math.random() * 9000) + 1000;
    const streetName = "Main St";
    const rating = (3.5 + Math.random() * 1.5);
    const zipPrefix = location.city === "New York" ? "10" : location.city === "Los Angeles" ? "90" : "30";
    const zipCode = zipPrefix + Math.floor(Math.random() * 100).toString().padStart(3, '0');
    
    return {
      id: 3000 + Math.floor(Math.random() * 9000),
      name: chainsToUse[i],
      address: `${streetNumber} ${streetName}, ${location.city}, ${location.state}`,
      phone: `+1 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      hours: Math.random() > 0.5 ? "9am - 7pm" : "10am - 6pm",
      distance: (0.5 + Math.random() * 5).toFixed(1) + ' miles',
      rating: rating,
      chain: chainsToUse[i],
      zipCode: zipCode,
      city: location.city,
      state: location.state
    };
  });
};

// Generate realistic US-based pharmacies for specific cities
const generateUSCityPharmacies = (cityState: string): Pharmacy[] => {
  console.log("Generating US city pharmacies for:", cityState);
  
  const [city, state] = cityState.split(", ");
  
  // Major US pharmacy chains
  const usPharmacyChains = [
    "CVS Pharmacy", 
    "Walgreens", 
    "Rite Aid", 
    "Walmart Pharmacy", 
    "Target Pharmacy",
    "Publix Pharmacy",
    "Kroger Pharmacy",
    "Costco Pharmacy",
    "Sam's Club Pharmacy"
  ];
  
  // Med spa chains
  const medSpaChains = [
    "Ideal Image Med Spa",
    "LaserAway",
    "Pure Med Spa",
    "Massage Envy",
    "Hand & Stone Massage and Facial Spa",
    "European Wax Center",
    "Botanica Day Spa"
  ];
  
  // Street name templates
  const streetTemplates = [
    "Main St", "Broadway", "5th Ave", "Market St", "Oak St", "Washington Ave",
    "Peachtree Rd", "State St", "University Ave", "Park Ave", "Highland Dr",
    "Center St", "Maple Ave", "Riverside Dr", "Lincoln Ave"
  ];
  
  // Generate 3-5 pharmacies
  const pharmacyCount = 3 + Math.floor(Math.random() * 3);
  
  // Generate 2-4 med spas
  const medSpaCount = 2 + Math.floor(Math.random() * 3);
  
  let results: Pharmacy[] = [];
  
  // Add pharmacies
  results = Array.from({ length: pharmacyCount }, (_, i) => {
    const chainName = usPharmacyChains[i % usPharmacyChains.length];
    const streetNumber = Math.floor(Math.random() * 9000) + 1000;
    const streetName = streetTemplates[Math.floor(Math.random() * streetTemplates.length)];
    const rating = (3.5 + Math.random() * 1.5);
    const zipPrefix = city === "New York" ? "10" : city === "Los Angeles" ? "90" : "30";
    const zipCode = zipPrefix + Math.floor(Math.random() * 100).toString().padStart(3, '0');
    
    return {
      id: 2000 + Math.floor(Math.random() * 9000),
      name: chainName,
      address: `${streetNumber} ${streetName}, ${city}, ${state}`,
      phone: `+1 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      hours: Math.random() > 0.5 ? "24 hours" : "8am - 10pm",
      distance: (0.5 + Math.random() * 5).toFixed(1) + ' miles',
      rating: rating,
      chain: chainName,
      zipCode: zipCode,
      city: city,
      state: "USA"
    };
  });
  
  // Add med spas
  const medSpas = Array.from({ length: medSpaCount }, (_, i) => {
    const chainName = medSpaChains[i % medSpaChains.length];
    const streetNumber = Math.floor(Math.random() * 9000) + 1000;
    const streetName = streetTemplates[Math.floor(Math.random() * streetTemplates.length)];
    const rating = (3.5 + Math.random() * 1.5);
    const zipPrefix = city === "New York" ? "10" : city === "Los Angeles" ? "90" : "30";
    const zipCode = zipPrefix + Math.floor(Math.random() * 100).toString().padStart(3, '0');
    
    return {
      id: 4000 + Math.floor(Math.random() * 9000),
      name: chainName,
      address: `${streetNumber} ${streetName}, ${city}, ${state}`,
      phone: `+1 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      hours: "9am - 7pm",
      distance: (0.5 + Math.random() * 5).toFixed(1) + ' miles',
      rating: rating,
      chain: chainName,
      zipCode: zipCode,
      city: city,
      state: "USA"
    };
  });
  
  return [...results, ...medSpas];
};

// Function to simulate international pharmacy search
// In a real app, this would connect to an API like Google Places or a global pharmacy database
const getInternationalPharmacies = (location: string): Pharmacy[] => {
  console.log("Simulating international search for:", location);
  
  // Normalize the location input - remove language codes and clean
  const normalizedLocation = cleanSearchTerm(location).toLowerCase().trim();
  
  console.log("Normalized international location search:", normalizedLocation);
  
  // US cities to prioritize
  const usCities = {
    "alpharetta": "Alpharetta, GA",
    "atlanta": "Atlanta, GA"
  };
  
  // Check if this is a known US city that should get US results
  if (normalizedLocation in usCities) {
    return generateUSCityPharmacies(usCities[normalizedLocation as keyof typeof usCities]);
  }
  
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
  
  // Clean the query by removing language codes
  const normalizedQuery = cleanSearchTerm(query).toLowerCase().trim();
  
  console.log("Normalized query for intelligent search:", normalizedQuery);
  
  // Check for pharmacy or med spa specific terms
  const isPharmacySearch = /pharma(c|cy|cies|s)|drug\s?store|medication|pill|medicine|prescription/.test(normalizedQuery);
  const isMedSpaSearch = /med spa|medispa|med-spa|spa|cosmetic|aesthetic|beauty|salon|wellness|massage|facial|botox|laser|skin|treatment/.test(normalizedQuery);
  
  // Try to determine if the query is a ZIP code, phone number, or a city name
  const isZipCode = /^\d{5}(-\d{4})?$/.test(normalizedQuery) || // US format
                   /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(normalizedQuery) || // Canadian format
                   /^[A-Za-z]{1,2}\d{1,2}[A-Za-z]? ?\d[A-Za-z]{2}$/.test(normalizedQuery); // UK format
  
  const isPhoneNumber = /(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(normalizedQuery);
  
  // Check for location-based search patterns
  const locationPattern = /(in|near|at|around)\s+([a-zA-Z\s]+)/;
  const hasLocation = locationPattern.test(normalizedQuery);
  let locationMatch = null;
  let locationName = "";
  
  if (hasLocation) {
    locationMatch = normalizedQuery.match(locationPattern);
    locationName = locationMatch ? locationMatch[2].trim() : "";
    console.log("Extracted location:", locationName);
  }
  
  // Look for ZIP code patterns in the query
  const zipMatch = normalizedQuery.match(/\b\d{5}\b/);  // US ZIP
  const zipQuery = zipMatch ? zipMatch[0] : normalizedQuery;
  
  // US cities to prioritize
  const usCities = {
    "alpharetta": "Alpharetta, GA",
    "atlanta": "Atlanta, GA"
  };
  
  // Check if this is a known US city that should get US results
  if (normalizedQuery in usCities) {
    return generateUSCityPharmacies(usCities[normalizedQuery as keyof typeof usCities]);
  }
  
  // Get results based on query type
  let results: Pharmacy[] = [];
  
  if (isPhoneNumber) {
    // Phone number search
    results = searchPharmaciesByPhone(normalizedQuery);
  }
  else if (isZipCode || zipMatch) {
    // ZIP code search
    results = searchPharmaciesByZip(zipQuery);
  } 
  else if (hasLocation && locationName) {
    // Location-based search
    results = searchPharmaciesByCity(locationName);
  }
  else if (isMedSpaSearch) {
    // Med spa specific search
    results = generateMedSpaResults(normalizedQuery);
    
    // Also check if there are any location terms to filter by
    const cityMatches = normalizedQuery.match(/\b(new york|chicago|los angeles|miami|tampa|boston|san francisco|alpharetta|atlanta)\b/gi);
    if (cityMatches && cityMatches.length > 0) {
      // Also get results by that city and add med spas
      const cityResults = searchPharmaciesByCity(cityMatches[0]);
      
      // Filter for likely med spas based on name
      const medSpaResults = cityResults.filter(p => 
        p.name.toLowerCase().includes("spa") ||
        p.name.toLowerCase().includes("wellness") ||
        p.name.toLowerCase().includes("beauty") ||
        p.name.toLowerCase().includes("clinic") ||
        p.name.toLowerCase().includes("aesthetic")
      );
      
      // Add any med spa results we found to the list
      medSpaResults.forEach(spa => {
        if (!results.some(r => r.id === spa.id)) {
          results.push(spa);
        }
      });
    }
  }
  else if (isPharmacySearch) {
    // Generic pharmacy search - check if there are any location terms in the query
    const cityMatches = normalizedQuery.match(/\b(new york|chicago|los angeles|miami|tampa|boston|san francisco|alpharetta|atlanta)\b/gi);
    if (cityMatches && cityMatches.length > 0) {
      // Search by the city mentioned in the query
      results = searchPharmaciesByCity(cityMatches[0]);
    } else {
      // If no specific city is mentioned, search all pharmacies and sort by rating
      results = pharmacies
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10)
        .map(pharmacy => ({
          ...pharmacy,
          distance: "Varies by location"
        }));
    }
  }
  else {
    // Try a hybrid approach - search both by city and generic terms
    const cityResults = searchPharmaciesByCity(normalizedQuery);
    
    // Look for pharmacy/med spa names, chains, or addresses
    const nameResults = pharmacies.filter(pharmacy => 
      pharmacy.name.toLowerCase().includes(normalizedQuery) ||
      pharmacy.address.toLowerCase().includes(normalizedQuery) ||
      pharmacy.chain.toLowerCase().includes(normalizedQuery)
    );
    
    // Combine results without duplicates
    results = [...cityResults];
    nameResults.forEach(pharmacy => {
      if (!results.some(p => p.id === pharmacy.id)) {
        results.push({
          ...pharmacy,
          distance: "Varies by location"
        });
      }
    });
    
    // If still no results, add some med spa results
    if (results.length === 0) {
      results = generateMedSpaResults(normalizedQuery);
    }
    
    // If still no results, add some global results
    if (results.length === 0) {
      results = getInternationalPharmacies(normalizedQuery);
    }
  }
  
  console.log("Total results after AI search:", results.length);
  
  // Sort by rating unless it's a zip code search (where distance matters more)
  if (!isZipCode) {
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  
  return results;
};
