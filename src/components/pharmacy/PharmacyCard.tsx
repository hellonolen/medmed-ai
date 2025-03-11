
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pharmacy } from '@/data/pharmacies';
import { MapPin, Phone, Clock } from 'lucide-react';

export interface PharmacyCardProps {
  pharmacy: Pharmacy;
  onLocationSelect?: (pharmacy: Pharmacy) => void;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy, onLocationSelect }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 bg-[#F1F0FB] border-gray-200" 
      onClick={() => onLocationSelect && onLocationSelect(pharmacy)}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">{pharmacy.name}</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{pharmacy.address}, {pharmacy.city}, {pharmacy.state} {pharmacy.zipCode}</span>
          </div>
          
          {pharmacy.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700">{pharmacy.phone}</span>
            </div>
          )}
          
          {pharmacy.hours && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700">{pharmacy.hours}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
