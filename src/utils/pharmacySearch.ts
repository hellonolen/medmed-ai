
import { Pharmacy, pharmacies } from "@/data/pharmacies";

export const searchPharmaciesByZip = (zipCode: string): Pharmacy[] => {
  if (!zipCode || zipCode.length < 5) return [];
  
  // In a real app, we would call an API with the zipCode
  // For demo, we'll return all pharmacies with randomized distances
  return pharmacies.map(pharmacy => ({
    ...pharmacy,
    distance: (Math.random() * 5).toFixed(1) + ' miles' // Randomize distances
  }));
};

export const searchPharmaciesByCity = (city: string): Pharmacy[] => {
  if (!city) return [];
  
  // Filter by city name (case-insensitive)
  return pharmacies.filter(pharmacy => 
    pharmacy.address.toLowerCase().includes(city.toLowerCase())
  );
};
