
import { Pharmacy } from "@/data/pharmacies";
import { PharmacyCard } from "./PharmacyCard";

interface PharmacyListProps {
  pharmacies: Pharmacy[];
  searchTerm: string;
  searchType: 'zip' | 'city';
  isLoading: boolean;
  hasSearched: boolean;
}

export const PharmacyList = ({ 
  pharmacies, 
  searchTerm, 
  searchType, 
  isLoading, 
  hasSearched 
}: PharmacyListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Searching for pharmacies...</p>
      </div>
    );
  }

  if (hasSearched && pharmacies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No pharmacies found for this {searchType === 'city' ? 'city' : 'ZIP code'}
        </p>
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-xl font-semibold mb-4">
        Pharmacies {searchType === 'city' ? `in ${searchTerm}` : `Near ${searchTerm}`}
      </h2>
      
      {pharmacies.map((pharmacy) => (
        <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
      ))}
    </div>
  );
};
