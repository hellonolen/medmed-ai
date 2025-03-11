
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type PeriodType = 'daily' | 'three_days' | 'weekly' | 'monthly' | 'custom';

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  className?: string;
}

const PeriodSelector = ({ selectedPeriod, onPeriodChange, className }: PeriodSelectorProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="period-selector">Time Period</Label>
      <Tabs 
        value={selectedPeriod} 
        onValueChange={(value) => onPeriodChange(value as PeriodType)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="three_days">3 Days</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {selectedPeriod === 'custom' && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="custom-period">Custom Period</Label>
            <Select defaultValue="7">
              <SelectTrigger id="custom-period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Last 2 days</SelectItem>
                <SelectItem value="5">Last 5 days</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;
