
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, MousePointerClick, Eye } from 'lucide-react';
import { PeriodType } from './PeriodSelector';
import { useSponsor } from '@/contexts/SponsorContext';
import { fetchSponsorAnalytics, SponsorAnalytics } from '@/services/SponsorAnalyticsService';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const StatCard = ({ title, value, change, icon, isLoading = false }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-16" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
            {change >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            {Math.abs(change)}% {change >= 0 ? 'increase' : 'decrease'} 
          </p>
        </>
      )}
    </CardContent>
  </Card>
);

interface SponsorStatsSummaryProps {
  period: PeriodType;
}

const SponsorStatsSummary = ({ period }: SponsorStatsSummaryProps) => {
  const { currentSponsor } = useSponsor();
  const [stats, setStats] = useState<SponsorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (!currentSponsor) return;
      
      setIsLoading(true);
      try {
        const data = await fetchSponsorAnalytics(currentSponsor.id, period);
        setStats(data);
      } catch (error) {
        console.error("Error fetching sponsor analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [currentSponsor, period]);
  
  // Calculate percentage changes
  // In a real app, these would come from comparing with previous period
  const getPercentageChange = (metric: 'impressions' | 'clicks' | 'visitors' | 'ctr'): number => {
    // Generates a pseudo-random but stable percentage between -5 and +10
    const seed = currentSponsor?.id.charCodeAt(0) || 0;
    const value = ((seed * period.length) % 15) - 5;
    return parseFloat(value.toFixed(1));
  };
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
      <StatCard
        title="Total Impressions"
        value={stats ? stats.impressions.toLocaleString() : "0"}
        change={getPercentageChange('impressions')}
        icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Total Clicks"
        value={stats ? stats.clicks.toLocaleString() : "0"}
        change={getPercentageChange('clicks')}
        icon={<MousePointerClick className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Unique Visitors"
        value={stats ? stats.visitors.toLocaleString() : "0"}
        change={getPercentageChange('visitors')}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Click Through Rate"
        value={stats ? `${stats.ctr.toFixed(2)}%` : "0%"}
        change={getPercentageChange('ctr')}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SponsorStatsSummary;
