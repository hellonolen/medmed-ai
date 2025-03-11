
import { Pharmacy } from "@/data/pharmacies";
import { PharmacyCard } from "./PharmacyCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, MapPinIcon, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface PharmacyListProps {
  pharmacies: Pharmacy[];
  searchTerm: string;
  searchType: 'zip' | 'city' | 'smart' | 'phone' | 'name';
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
  const [activeTab, setActiveTab] = useState<string>("all");
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-500">Searching worldwide healthcare database...</p>
      </div>
    );
  }

  if (hasSearched && pharmacies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No results found for{' '}
          {searchType === 'city' ? 'location' : 
           searchType === 'zip' ? 'postal code' : 
           searchType === 'phone' ? 'phone number' :
           searchType === 'name' ? 'facility name' :
           'search term'}: "{searchTerm.replace(/\s*\([a-z]{2}\)\s*/g, "")}"
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
  
  // Clean the display search term by removing language codes
  const displaySearchTerm = searchTerm.replace(/\s*\([a-z]{2}\)\s*/g, "").trim();

  // Categorize results by type
  const pharmacyResults = pharmacies.filter(p => !p.chain?.toLowerCase().includes('spa') && !p.name.toLowerCase().includes('spa'));
  const medSpaResults = pharmacies.filter(p => 
    p.chain?.toLowerCase().includes('spa') || 
    p.name.toLowerCase().includes('spa') || 
    p.name.toLowerCase().includes('aesthetic') ||
    p.name.toLowerCase().includes('beauty') ||
    p.name.toLowerCase().includes('cosmetic') ||
    p.name.toLowerCase().includes('wellness')
  );
  
  // Group pharmacies by country/region for better organization
  const groupByRegion = (items: Pharmacy[]) => {
    const grouped: { [key: string]: Pharmacy[] } = {};
    items.forEach(item => {
      const key = item.state;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  };
  
  const groupedPharmacies = groupByRegion(pharmacyResults);
  const groupedMedSpas = groupByRegion(medSpaResults);
  
  // Sort countries/regions by name for consistent display
  const sortedPharmacyRegions = Object.keys(groupedPharmacies).sort();
  const sortedMedSpaRegions = Object.keys(groupedMedSpas).sort();
  
  // Check if we have international results
  const hasInternationalResults = pharmacies.some(p => p.distance === "International");
  
  // Check if we're showing results from multiple countries
  const countries = [...new Set(pharmacies.map(p => p.state))];
  const isGlobalSearch = countries.length > 1;
  
  // Determine if we're showing med spa results
  const showMedSpaTab = medSpaResults.length > 0;

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-xl font-semibold flex items-center">
        <span>
          {searchType === 'smart' 
            ? `Results for "${displaySearchTerm}"`
            : searchType === 'city' 
              ? `Healthcare Facilities in ${displaySearchTerm}`
              : searchType === 'phone'
                ? `Facilities with Phone Number: ${displaySearchTerm}`
                : searchType === 'name'
                  ? `Results for "${displaySearchTerm}"`
                  : `Facilities Near ${displaySearchTerm}`}
        </span>
        <Sparkles className="h-4 w-4 ml-2 text-primary" />
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
            Showing results from {countries.length} regions: {countries.join(', ')}
          </p>
        </div>
      )}
      
      {/* Add tabs if we have both pharmacies and med spas */}
      {showMedSpaTab ? (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Results ({pharmacies.length})</TabsTrigger>
            <TabsTrigger value="pharmacies">Pharmacies ({pharmacyResults.length})</TabsTrigger>
            <TabsTrigger value="medspas">Med Spas & Clinics ({medSpaResults.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {renderResults(pharmacies, true)}
          </TabsContent>
          
          <TabsContent value="pharmacies" className="mt-0">
            {pharmacyResults.length > 0 ? (
              renderGroupedResults(groupedPharmacies, sortedPharmacyRegions)
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No pharmacy results found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="medspas" className="mt-0">
            {medSpaResults.length > 0 ? (
              renderGroupedResults(groupedMedSpas, sortedMedSpaRegions)
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No med spa results found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        renderResults(pharmacies, false)
      )}
    </div>
  );
  
  // Helper function to render all results ungrouped
  function renderResults(results: Pharmacy[], showType: boolean) {
    return (
      <div className="space-y-4">
        {results.map((facility) => (
          <PharmacyCard 
            key={facility.id} 
            pharmacy={facility} 
            highlightType={showType && isMedSpa(facility)}
          />
        ))}
      </div>
    );
  }
  
  // Helper function to render grouped results by region
  function renderGroupedResults(grouped: { [key: string]: Pharmacy[] }, regions: string[]) {
    return regions.map((location) => (
      <div key={location} className="mb-6">
        <h3 className="text-lg font-medium text-primary mb-3 border-b pb-2">
          {location}
        </h3>
        <div className="space-y-4">
          {grouped[location].map((facility) => (
            <PharmacyCard 
              key={facility.id} 
              pharmacy={facility} 
              highlightType={false}
            />
          ))}
        </div>
      </div>
    ));
  }
  
  // Helper function to determine if a facility is a med spa
  function isMedSpa(facility: Pharmacy): boolean {
    return facility.chain?.toLowerCase().includes('spa') || 
      facility.name.toLowerCase().includes('spa') || 
      facility.name.toLowerCase().includes('aesthetic') ||
      facility.name.toLowerCase().includes('beauty') ||
      facility.name.toLowerCase().includes('cosmetic') ||
      facility.name.toLowerCase().includes('wellness');
  }
};
