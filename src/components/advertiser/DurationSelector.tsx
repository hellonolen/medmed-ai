
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/formatUtils";
import { AdPackage } from "./AdPackageCard";

interface DurationSelectorProps {
  selectedPackage: string;
  durationWeeks: number;
  setDurationWeeks: (value: number) => void;
  adPackages: AdPackage[];
  maxDurationWeeks: number;
}

const DurationSelector = ({
  selectedPackage,
  durationWeeks,
  setDurationWeeks,
  adPackages,
  maxDurationWeeks
}: DurationSelectorProps) => {
  
  // Calculate total price based on package and duration
  const calculateTotalPrice = () => {
    const packagePrice = adPackages.find(p => p.id === selectedPackage)?.price || 0;
    return packagePrice * durationWeeks;
  };

  return (
    <Card className="mt-6 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Advertisement Duration</CardTitle>
        <CardDescription>
          Choose how long you want your ad to run (up to 3 months)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>1 week</span>
              <span>{maxDurationWeeks} weeks (3 months)</span>
            </div>
            <Slider
              value={[durationWeeks]}
              min={1}
              max={maxDurationWeeks}
              step={1}
              onValueChange={(value) => setDurationWeeks(value[0])}
            />
            <div className="text-center mt-2">
              <span className="text-lg font-semibold">{durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}</span>
              {durationWeeks >= 4 && (
                <span className="text-sm text-gray-500 ml-2">
                  ({Math.floor(durationWeeks / 4)} {Math.floor(durationWeeks / 4) === 1 ? 'month' : 'months'} 
                  {durationWeeks % 4 > 0 ? ` and ${durationWeeks % 4} ${durationWeeks % 4 === 1 ? 'week' : 'weeks'}` : ''})
                </span>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-primary/5 rounded-md">
            <h4 className="font-medium mb-2">Payment Summary</h4>
            <div className="flex justify-between text-sm mb-1">
              <span>{adPackages.find(p => p.id === selectedPackage)?.name}</span>
              <span>{formatCurrency(adPackages.find(p => p.id === selectedPackage)?.price || 0)}/week</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span>Duration</span>
              <span>{durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>{formatCurrency(calculateTotalPrice())}</span>
            </div>
            <div className="mt-3 text-xs flex items-start gap-2 text-amber-700 bg-amber-50 p-2 rounded">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>All payments are upfront for the full duration. No refunds will be provided once the ad is approved and published.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DurationSelector;
