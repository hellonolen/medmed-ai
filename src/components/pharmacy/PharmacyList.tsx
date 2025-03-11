
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pharmacy } from '@/data/pharmacies';
import { PharmacyCard } from './PharmacyCard';

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
      {pharmacies.map((pharmacy) => (
        <PharmacyCard 
          key={pharmacy.id} 
          pharmacy={pharmacy}
          onLocationSelect={onLocationSelect}
        />
      ))}
    </div>
  );
};
