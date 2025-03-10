
import { Pharmacy } from "@/data/pharmacies";
import { PharmacyCard } from "./PharmacyCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, MapPinIcon } from "lucide-react";

interface PharmacyListProps {
  pharmacies: Pharmacy[];
  searchTerm: string;
  searchType: 'zip' | 'city' | 'smart';
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
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-500">Searching worldwide pharmacy database...</p>
      </div>
    );
  }

  if (hasSearched && pharmacies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No pharmacies found for{' '}
          {searchType === 'city' ? 'location' : 
           searchType === 'zip' ? 'postal code' : 
           'search term'}: "{searchTerm}"
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Try using different search terms or switch to Smart Search for better results
        </p>
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return null;
  }

  // Group pharmacies by country/region for better organization
  const groupedPharmacies: { [key: string]: Pharmacy[] } = {};
  pharmacies.forEach(pharmacy => {
    const key = pharmacy.state;
    if (!groupedPharmacies[key]) {
      groupedPharmacies[key] = [];
    }
    groupedPharmacies[key].push(pharmacy);
  });

  // Sort countries/regions by name for consistent display
  const sortedRegions = Object.keys(groupedPharmacies).sort();
  
  // Check if we have international results
  const hasInternationalResults = pharmacies.some(p => p.distance === "International");
  
  // Check if we're showing results from multiple countries
  const countries = [...new Set(pharmacies.map(p => p.state))];
  const isGlobalSearch = countries.length > 1;

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-xl font-semibold">
        {searchType === 'smart' 
          ? `Pharmacy Results for "${searchTerm}"`
          : searchType === 'city' 
            ? `Pharmacies in ${searchTerm}`
            : `Pharmacies Near ${searchTerm}`}
      </h2>
      
      {hasInternationalResults && (
        <Alert className="bg-blue-50 border-blue-200 mb-4">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Showing international results. Distances and availability may vary.
          </AlertDescription>
        </Alert>
      )}
      
      {isGlobalSearch && (
        <div className="flex flex-wrap gap-2 mb-4">
          <MapPinIcon className="h-4 w-4 text-primary mt-1" />
          <p className="text-sm text-gray-600">
            Showing results from {countries.length} countries/regions: {countries.join(', ')}
          </p>
        </div>
      )}
      
      {sortedRegions.map((location) => (
        <div key={location} className="mb-6">
          <h3 className="text-lg font-medium text-primary mb-3 border-b pb-2">
            {location}
          </h3>
          <div className="space-y-4">
            {groupedPharmacies[location].map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

