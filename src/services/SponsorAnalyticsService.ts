
import { PeriodType } from "@/components/sponsor/PeriodSelector";

// Define the data structure for analytics
export interface SponsorAnalytics {
  impressions: number;
  clicks: number;
  visitors: number;
  ctr: number;
  name: string;
}

export interface SponsorChartData {
  name: string;
  impressions: number;
  clicks: number;
}

// Mock data based on sponsor ID and period
export const fetchSponsorAnalytics = async (
  sponsorId: string,
  period: PeriodType
): Promise<SponsorAnalytics> => {
  // In a real implementation, this would be an API call to fetch real data
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate seed based on sponsor ID for consistent randomness
  const seed = sponsorId.charCodeAt(sponsorId.length - 1);
  
  // Multiplier based on period
  const multiplier = 
    period === 'daily' ? 1 : 
    period === 'three_days' ? 3 : 
    period === 'weekly' ? 7 : 30;
  
  // Generate pseudo-random but consistent data for each sponsor
  const baseImpressions = ((seed * 100) % 500) + 500;
  const baseClicks = ((seed * 50) % 150) + 100;
  const baseVisitors = ((seed * 25) % 100) + 50;
  
  return {
    impressions: Math.floor(baseImpressions * multiplier),
    clicks: Math.floor(baseClicks * multiplier),
    visitors: Math.floor(baseVisitors * multiplier),
    ctr: parseFloat(((baseClicks / baseImpressions) * 100).toFixed(2)),
    name: period
  };
};

// Fetch chart data for a specific sponsor
export const fetchSponsorChartData = async (
  sponsorId: string,
  period: PeriodType
): Promise<SponsorChartData[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Generate seed based on sponsor ID
  const seed = sponsorId.charCodeAt(sponsorId.length - 1);
  const data: SponsorChartData[] = [];
  
  // Generate data based on period
  if (period === 'daily') {
    // Hours in a day
    for (let i = 0; i < 24; i++) {
      data.push({
        name: `${i}:00`,
        impressions: Math.floor(((seed * i) % 50) + 20 + Math.random() * 30),
        clicks: Math.floor(((seed * i) % 15) + 5 + Math.random() * 10),
      });
    }
  } else if (period === 'three_days') {
    // Last 3 days by hour
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 8; j++) {
        data.push({
          name: `Day ${i+1} - ${j*3}:00`,
          impressions: Math.floor(((seed * (i+j)) % 80) + 20 + Math.random() * 40),
          clicks: Math.floor(((seed * (i+j)) % 25) + 5 + Math.random() * 15),
        });
      }
    }
  } else if (period === 'weekly') {
    // Days of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    days.forEach((day, i) => {
      data.push({
        name: day,
        impressions: Math.floor(((seed * (i+1)) % 300) + 100 + Math.random() * 200),
        clicks: Math.floor(((seed * (i+1)) % 100) + 20 + Math.random() * 50),
      });
    });
  } else {
    // Monthly (last 30 days)
    for (let i = 1; i <= 30; i++) {
      data.push({
        name: `Day ${i}`,
        impressions: Math.floor(((seed * i) % 300) + 100 + Math.random() * 200),
        clicks: Math.floor(((seed * i) % 100) + 20 + Math.random() * 50),
      });
    }
  }
  
  return data;
};
