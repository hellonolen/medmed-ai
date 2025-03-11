
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PharmacySearchForm } from '@/components/pharmacy/PharmacySearchForm';
import { PharmacyList } from '@/components/pharmacy/PharmacyList';
import { PharmacyMap } from '@/components/PharmacyMap';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, MapPin, List } from 'lucide-react';
import { pharmacies } from '@/data/pharmacies';
import { useLanguage } from '@/contexts/LanguageContext';
import { Pharmacy } from '@/data/pharmacies';

const INITIAL_MAP_CENTER: [number, number] = [40.7128, -74.0060]; // NYC

const PharmacyFinder = () => {
  const [searchParams] = useSearchParams();
  const initialName = searchParams.get('name') || '';
  const [selectedView, setSelectedView] = useState<'list' | 'map'>('list');
  const [results, setResults] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(INITIAL_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(11);
  const { t } = useLanguage();
  
  useEffect(() => {
    if (initialName) {
      const filteredPharmacies = pharmacies.filter(p => 
        p.name.toLowerCase().includes(initialName.toLowerCase())
      );
      handleSearch(filteredPharmacies);
    }
  }, [initialName]);

  const handleSearch = (pharmacyResults: Pharmacy[]) => {
    setLoading(true);
    setSearched(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setResults(pharmacyResults);
      
      // Update map center if results exist
      if (pharmacyResults.length > 0 && pharmacyResults[0].coordinates) {
        setMapCenter(pharmacyResults[0].coordinates);
        setMapZoom(14);
      }
      
      setLoading(false);
    }, 500);
  };
  
  const handleLocationSelect = (pharmacy: Pharmacy) => {
    if (pharmacy.coordinates) {
      setMapCenter(pharmacy.coordinates);
      setMapZoom(16);
      setSelectedView('map');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold">{t("pharmacy.title", "Find Pharmacies & Med Spas")}</h1>
        
        <p className="text-gray-600">
          {t("pharmacy.description", "Search for pharmacies and medical spas near you. You can search by name, city, or zip code.")}
        </p>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <PharmacySearchForm 
              onResultsFound={handleSearch} 
              initialName={initialName} 
            />
          </CardContent>
        </Card>
        
        {searched && (
          <>
            <div className="flex justify-between items-center mt-4">
              <h2 className="text-xl font-semibold">
                {results.length > 0 
                  ? t("pharmacy.results_title", `Found ${results.length} locations`)
                  : t("pharmacy.no_results", "No locations found")}
              </h2>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant={selectedView === 'list' ? 'default' : 'outline'} 
                  onClick={() => setSelectedView('list')}
                >
                  <List className="h-4 w-4 mr-2" />
                  {t("pharmacy.list_view", "List")}
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedView === 'map' ? 'default' : 'outline'} 
                  onClick={() => setSelectedView('map')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {t("pharmacy.map_view", "Map")}
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              {selectedView === 'list' ? (
                <PharmacyList 
                  pharmacies={results} 
                  isLoading={loading} 
                  onLocationSelect={handleLocationSelect}
                />
              ) : (
                <div className="h-[600px] rounded-lg overflow-hidden border bg-white shadow-inner">
                  <PharmacyMap 
                    pharmacies={results}
                    center={mapCenter}
                    zoom={mapZoom}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PharmacyFinder;
