
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Layout from "@/components/Layout";
import PeriodSelector, { PeriodType } from "@/components/sponsor/PeriodSelector";
import SponsorStatsChart from "@/components/sponsor/SponsorStatsChart";
import SponsorStatsSummary from "@/components/sponsor/SponsorStatsSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const SponsorDashboard = () => {
  const [period, setPeriod] = useState<PeriodType>('weekly');
  const { t } = useLanguage();
  
  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
  };
  
  const handleExportData = (format: 'csv' | 'pdf') => {
    // In a real app, this would trigger a download of the stats data
    console.log(`Exporting data in ${format} format for period: ${period}`);
    alert(`Your ${format.toUpperCase()} report is being generated and will download shortly.`);
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("sponsor.dashboard.title", "Sponsor Dashboard")}
            </h1>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExportData('csv')}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                {t("sponsor.dashboard.export_csv", "Export CSV")}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExportData('pdf')}
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                {t("sponsor.dashboard.export_pdf", "Export PDF")}
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {t("sponsor.dashboard.performance_overview", "Performance Overview")}
              </CardTitle>
              <CardDescription>
                {t("sponsor.dashboard.overview_description", "Track your ad campaign's performance metrics and ROI.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PeriodSelector 
                selectedPeriod={period} 
                onPeriodChange={handlePeriodChange} 
                className="mb-6"
              />
              
              <SponsorStatsSummary period={period} />
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <SponsorStatsChart period={period} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {t("sponsor.dashboard.campaign_details", "Campaign Details")}
              </CardTitle>
              <CardDescription>
                {t("sponsor.dashboard.campaign_description", "View detailed information about your active campaigns.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active Campaigns</TabsTrigger>
                  <TabsTrigger value="past">Past Campaigns</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Spring Promotion</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mar 15, 2023</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jun 15, 2023</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$5,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="past">
                  <p className="text-center text-gray-500 py-8">No past campaigns to display.</p>
                </TabsContent>
                
                <TabsContent value="scheduled">
                  <p className="text-center text-gray-500 py-8">No scheduled campaigns to display.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SponsorDashboard;
