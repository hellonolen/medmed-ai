
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pharmacy } from '@/data/pharmacies';
import { PharmacyCard } from './PharmacyCard';
import { Button } from '@/components/ui/button';
import { MapPin, List, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PharmacyListProps {
  pharmacies: Pharmacy[];
  isLoading?: boolean;
  onLocationSelect?: (pharmacy: Pharmacy) => void;
}

export const PharmacyList: React.FC<PharmacyListProps> = ({
  pharmacies,
  isLoading = false,
  onLocationSelect
}) => {
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'distance'>('name');
  
  const filteredPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.name.toLowerCase().includes(filterText.toLowerCase()) ||
    pharmacy.city.toLowerCase().includes(filterText.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(filterText.toLowerCase())
  );
  
  const sortedPharmacies = [...filteredPharmacies].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      // For distance, we'd normally calculate actual distance,
      // but for simplicity, we'll just use alphabetical here
      return a.city.localeCompare(b.city);
    }
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse bg-[#F1F1F1]">
            <CardContent className="p-6 h-32"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return (
      <Card className="bg-[#F1F1F1]">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No pharmacies found matching your search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="relative flex-1">
            <Input
              placeholder="Filter by name or location..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-9"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={sortBy === 'name' ? 'default' : 'outline'} 
              onClick={() => setSortBy('name')}
            >
              <List className="h-4 w-4 mr-2" />
              Name
            </Button>
            <Button 
              size="sm" 
              variant={sortBy === 'distance' ? 'default' : 'outline'} 
              onClick={() => setSortBy('distance')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedPharmacies.length > 0 ? (
          sortedPharmacies.map((pharmacy) => (
            <PharmacyCard 
              key={pharmacy.id} 
              pharmacy={pharmacy}
              onLocationSelect={onLocationSelect}
            />
          ))
        ) : (
          <Card className="bg-[#F1F1F1]">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No pharmacies found matching your filter.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
