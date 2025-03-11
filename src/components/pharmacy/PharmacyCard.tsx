import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pharmacy } from '@/data/pharmacies';

export interface PharmacyCardProps {
  pharmacy: Pharmacy;
  onLocationSelect?: (pharmacy: Pharmacy) => void;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy, onLocationSelect }) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => onLocationSelect && onLocationSelect(pharmacy)}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold">{pharmacy.name}</h3>
        <p className="text-sm text-gray-500">{pharmacy.address}, {pharmacy.city}, {pharmacy.state} {pharmacy.zipCode}</p>
        <p className="text-sm text-gray-500">{pharmacy.phone}</p>
      </CardContent>
    </Card>
  );
};
