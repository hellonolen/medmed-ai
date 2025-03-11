
import React from "react";
import { formatCurrency } from "@/utils/formatUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type AdPackage = {
  id: string;
  name: string;
  price: number; 
  description: string;
  features: string[];
};

interface AdPackageCardProps {
  pkg: AdPackage;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const AdPackageCard = ({ pkg, isSelected, onSelect }: AdPackageCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'border-primary/70 shadow-md' : 'hover:border-gray-300'}`}
      onClick={() => onSelect(pkg.id)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{pkg.name}</h3>
          <div className="text-primary font-bold">{formatCurrency(pkg.price)}/week</div>
        </div>
        <p className="text-sm mt-2">{pkg.description}</p>
        
        <ul className="mt-3 space-y-1">
          {pkg.features.map((feature, index) => (
            <li key={index} className="text-xs text-gray-600 flex items-start">
              <span className="text-primary mr-1">•</span>
              {feature}
            </li>
          ))}
        </ul>
        
        <div className="mt-4">
          <Button 
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={() => onSelect(pkg.id)}
          >
            {isSelected ? "Selected" : "Select package"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdPackageCard;
