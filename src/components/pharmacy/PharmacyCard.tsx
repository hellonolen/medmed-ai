
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pharmacy } from '@/data/pharmacies';
import { MapPin, Phone, Clock, ExternalLink, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div>
              <h3 className="text-lg font-semibold">{pharmacy.name}</h3>
              {pharmacy.chain && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Building className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-sm text-gray-600">{pharmacy.chain}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{pharmacy.address}, {pharmacy.city}, {pharmacy.state} {pharmacy.zipCode}</span>
              </div>
              
              {pharmacy.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-gray-700">{pharmacy.phone}</span>
                </div>
              )}
              
              {pharmacy.hours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-gray-700">{pharmacy.hours}</span>
                </div>
              )}
              
              {pharmacy.website && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
                  <a href={pharmacy.website} 
                     className="text-primary hover:underline" 
                     onClick={(e) => e.stopPropagation()}>
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div>
            {pharmacy.type && (
              <Badge variant="outline" className="bg-secondary/20">
                {pharmacy.type}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
