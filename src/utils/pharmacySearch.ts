import { Pharmacy, pharmacies } from "@/data/pharmacies";

// Calculate a realistic distance based on ZIP code comparison
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

export const searchPharmaciesByZip = (zipCode: string): Pharmacy[] => {
  if (!zipCode || zipCode.length < 5) return [];
  
  // Filter pharmacies by ZIP code
  // First, try exact match
  let matchedPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.zipCode === zipCode
  );
  
  // If no exact matches, find pharmacies in the same area (first 3 digits of ZIP)
  if (matchedPharmacies.length === 0 && zipCode.length >= 3) {
    const zipPrefix = zipCode.substring(0, 3);
    matchedPharmacies = pharmacies.filter(pharmacy => 
      pharmacy.zipCode.startsWith(zipPrefix)
    );
  }
  
  // Calculate realistic distances based on ZIP code
  return matchedPharmacies.map(pharmacy => ({
    ...pharmacy,
    distance: calculateDistance(zipCode, pharmacy.zipCode)
  }));
};

export const searchPharmaciesByCity = (city: string): Pharmacy[] => {
  if (!city) return [];
  
  // Filter by city name (case-insensitive)
  const matchedPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.city.toLowerCase().includes(city.toLowerCase())
  );
  
  // Return pharmacies with randomized distances
  return matchedPharmacies.map(pharmacy => ({
    ...pharmacy,
    distance: (Math.random() * 5).toFixed(1) + ' miles'
  }));
};
