
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PeriodType } from './PeriodSelector';
import { useSponsor } from '@/contexts/SponsorContext';
import { fetchSponsorChartData, SponsorChartData } from '@/services/SponsorAnalyticsService';
import { Skeleton } from '@/components/ui/skeleton';

interface SponsorStatsChartProps {
  period: PeriodType;
}

const SponsorStatsChart = ({ period }: SponsorStatsChartProps) => {
  const { currentSponsor } = useSponsor();
  const [chartData, setChartData] = useState<SponsorChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (!currentSponsor) return;
      
      setIsLoading(true);
      try {
        const data = await fetchSponsorChartData(currentSponsor.id, period);
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [currentSponsor, period]);
  
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>
          {period === 'daily' && 'Performance metrics for the last 24 hours'}
          {period === 'three_days' && 'Performance metrics for the last 3 days'}
          {period === 'weekly' && 'Performance metrics for the last week'}
          {period === 'monthly' && 'Performance metrics for the last month'}
          {period === 'custom' && 'Performance metrics for the selected period'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="space-y-4 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-[350px] w-full rounded-lg" />
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="#8B5CF6" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                  name="Impressions" 
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#F97316" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                  name="Clicks" 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SponsorStatsChart;
