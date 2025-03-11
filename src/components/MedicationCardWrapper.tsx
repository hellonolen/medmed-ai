
import React from 'react';
import { MedicationCard } from './MedicationCard';
import { Badge } from '@/components/ui/badge';
import { Globe, Phone, MapPin } from 'lucide-react';

export interface MedicationCardWrapperProps {
  name: string;
  details: string;
  price: string;
  type?: string;
  source?: string;
  phone?: string;
  address?: string;
  isRecommended?: boolean;
}

export const MedicationCardWrapper = ({
  name,
  details,
  price,
  type,
  source,
  phone,
  address,
  isRecommended
}: MedicationCardWrapperProps) => {
  return (
    <div className={`relative h-full ${isRecommended ? 'ring-2 ring-primary/20 shadow-md' : ''}`}>
      <MedicationCard
        name={name}
        details={details}
        price={price}
        type={type}
        source={source}
      />
      {type && (
        <Badge className="absolute top-2 right-2 bg-secondary/80 text-secondary-foreground max-w-[40%] truncate">
          {type}
        </Badge>
      )}
      
      <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
        {source && (
          <div className="flex items-center gap-1 text-xs text-gray-500 max-w-[40%] truncate">
            <Globe className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{source}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-1 text-xs text-gray-500 max-w-[40%] truncate">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
        )}
        {address && (
          <div className="flex items-center gap-1 text-xs text-gray-500 max-w-[40%] truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        )}
      </div>
      
      {isRecommended && (
        <Badge className="absolute -top-2 -left-2 bg-primary text-white">
          Recommended
        </Badge>
      )}
    </div>
  );
};
