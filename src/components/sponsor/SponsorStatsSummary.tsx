
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, MousePointerClick, Eye } from 'lucide-react';
import { PeriodType } from './PeriodSelector';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
        {change >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
        {Math.abs(change)}% {change >= 0 ? 'increase' : 'decrease'} 
      </p>
    </CardContent>
  </Card>
);

interface SponsorStatsSummaryProps {
  period: PeriodType;
}

// Mock data generator based on period
const generateStats = (period: PeriodType) => {
  const multiplier = 
    period === 'daily' ? 1 : 
    period === 'three_days' ? 3 : 
    period === 'weekly' ? 7 : 30;
    
  return {
    impressions: Math.floor((Math.random() * 1000) + 500) * multiplier,
    clicks: Math.floor((Math.random() * 300) + 100) * multiplier,
    visitors: Math.floor((Math.random() * 200) + 50) * multiplier,
    ctr: Math.random() * 10 + 2
  };
};

const SponsorStatsSummary = ({ period }: SponsorStatsSummaryProps) => {
  const stats = generateStats(period);
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
      <StatCard
        title="Total Impressions"
        value={stats.impressions.toLocaleString()}
        change={3.2}
        icon={<Eye className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Total Clicks"
        value={stats.clicks.toLocaleString()}
        change={2.5}
        icon={<MousePointerClick className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Unique Visitors"
        value={stats.visitors.toLocaleString()}
        change={-0.8}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Click Through Rate"
        value={`${stats.ctr.toFixed(2)}%`}
        change={1.1}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};

export default SponsorStatsSummary;
