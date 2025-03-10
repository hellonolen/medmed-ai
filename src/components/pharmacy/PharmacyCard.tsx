
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Building, Star } from "lucide-react";
import { Pharmacy } from "@/data/pharmacies";

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

export const PharmacyCard = ({ pharmacy }: PharmacyCardProps) => {
  const getPharmacyRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card className="backdrop-blur-md bg-card/90 border-0 shadow hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-primary">{pharmacy.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" /> 
              <span>{pharmacy.distance}</span>
            </div>
            {getPharmacyRating(pharmacy.rating)}
          </div>
          
          <Button 
            onClick={() => {
              window.open(`https://www.google.com/maps/search/${encodeURIComponent(pharmacy.address)}`, '_blank');
            }}
          >
            Get Directions
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
          <div className="flex items-start gap-2">
            <Building className="h-4 w-4 text-gray-500 mt-0.5" />
            <span>{pharmacy.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{pharmacy.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{pharmacy.hours}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
