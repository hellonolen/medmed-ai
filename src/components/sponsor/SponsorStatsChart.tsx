
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PeriodType } from './PeriodSelector';

// Sample data generator
const generateData = (period: PeriodType) => {
  const data = [];
  
  if (period === 'daily') {
    // Hours in a day
    for (let i = 0; i < 24; i++) {
      data.push({
        name: `${i}:00`,
        impressions: Math.floor(Math.random() * 100) + 20,
        clicks: Math.floor(Math.random() * 30) + 5,
      });
    }
  } else if (period === 'three_days') {
    // Last 3 days by hour
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 8; j++) {
        data.push({
          name: `Day ${i+1} - ${j*3}:00`,
          impressions: Math.floor(Math.random() * 100) + 20,
          clicks: Math.floor(Math.random() * 30) + 5,
        });
      }
    }
  } else if (period === 'weekly') {
    // Days of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    days.forEach(day => {
      data.push({
        name: day,
        impressions: Math.floor(Math.random() * 500) + 100,
        clicks: Math.floor(Math.random() * 150) + 20,
      });
    });
  } else {
    // Monthly (last 30 days)
    for (let i = 1; i <= 30; i++) {
      data.push({
        name: `Day ${i}`,
        impressions: Math.floor(Math.random() * 500) + 100,
        clicks: Math.floor(Math.random() * 150) + 20,
      });
    }
  }
  
  return data;
};

interface SponsorStatsChartProps {
  period: PeriodType;
}

const SponsorStatsChart = ({ period }: SponsorStatsChartProps) => {
  const data = generateData(period);
  
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
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
              <Bar dataKey="impressions" fill="#8B5CF6" name="Impressions" />
              <Bar dataKey="clicks" fill="#F97316" name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SponsorStatsChart;
