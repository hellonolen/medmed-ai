
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Layout from "@/components/Layout";
import PeriodSelector, { PeriodType } from "@/components/sponsor/PeriodSelector";
import SponsorStatsChart from "@/components/sponsor/SponsorStatsChart";
import SponsorStatsSummary from "@/components/sponsor/SponsorStatsSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, FileText, LogOut, AlertCircle, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSponsor } from "@/contexts/SponsorContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const SponsorDashboard = () => {
  const [period, setPeriod] = useState<PeriodType>('weekly');
  const { t } = useLanguage();
  const { currentSponsor, logout, isLoading } = useSponsor();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !currentSponsor) {
      navigate('/sponsor-login');
    }
  }, [currentSponsor, isLoading, navigate]);
  
  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
  };
  
  const handleExportData = (format: 'csv' | 'pdf') => {
    toast({
      title: `Exporting ${format.toUpperCase()}`,
      description: `Your ${format.toUpperCase()} report is being generated and will download shortly.`,
    });
    
    // In a real app, this would trigger a download of the stats data
    console.log(`Exporting data in ${format} format for period: ${period}`);
    
    // Simulate download delay
    setTimeout(() => {
      const dummyLink = document.createElement('a');
      dummyLink.download = `sponsor-report-${period}.${format}`;
      dummyLink.href = `data:text/plain,This is a sample ${format} report for ${currentSponsor?.companyName}`;
      document.body.appendChild(dummyLink);
      dummyLink.click();
      document.body.removeChild(dummyLink);
    }, 2000);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/sponsor-login');
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Calculate days remaining if active
  const calculateDaysRemaining = () => {
    if (!currentSponsor?.endDate) return null;
    
    const endDate = new Date(currentSponsor.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  const daysRemaining = calculateDaysRemaining();
  
  // Show nothing while checking authentication
  if (isLoading) return null;
  
  // If not authenticated, will redirect via useEffect
  if (!currentSponsor) return null;
  
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t("sponsor.dashboard.title", "Sponsor Dashboard")}
              </h1>
              <p className="text-muted-foreground">
                {currentSponsor.companyName} - {currentSponsor.package} Package
              </p>
            </div>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
          
          {currentSponsor.isOnWaitlist ? (
            <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Your ad is currently on the waitlist</AlertTitle>
              <AlertDescription className="text-amber-700">
                Your {currentSponsor.package} ad is currently at position {currentSponsor.waitlistPosition} in the queue. 
                We'll automatically activate your ad and notify you when a slot becomes available.
              </AlertDescription>
            </Alert>
          ) : daysRemaining !== null && daysRemaining <= 7 ? (
            <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Your ad campaign is ending soon</AlertTitle>
              <AlertDescription className="text-amber-700">
                Your campaign will end in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}. 
                Would you like to renew your ad campaign?
                <Button variant="outline" size="sm" className="ml-4 mt-2 bg-white border-amber-300 text-amber-800">
                  Renew Campaign
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
          
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
              {currentSponsor.isActive ? (
                <>
                  <PeriodSelector 
                    selectedPeriod={period} 
                    onPeriodChange={handlePeriodChange} 
                    className="mb-6"
                  />
                  
                  <SponsorStatsSummary period={period} />
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SponsorStatsChart period={period} />
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <div className="bg-gray-100 inline-block p-4 rounded-full mb-4">
                    <Clock className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Waiting for Campaign Activation</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Your ad campaign is waiting to be activated. Performance metrics will be available once your ad is live.
                  </p>
                </div>
              )}
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
              <Tabs defaultValue="status">
                <TabsList className="mb-4">
                  <TabsTrigger value="status">Campaign Status</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="status">
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                          <div className="flex items-center">
                            <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                              currentSponsor.isActive ? 'bg-green-500' : 'bg-amber-500'
                            }`}></span>
                            <span className="font-medium">
                              {currentSponsor.isActive ? 'Active' : 'On Waitlist'}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Package</h3>
                          <p className="font-medium">{currentSponsor.package}</p>
                        </div>
                        
                        {currentSponsor.isActive && (
                          <>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{formatDate(currentSponsor.startDate)}</span>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{formatDate(currentSponsor.endDate)}</span>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-1">Time Remaining</h3>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                <span>
                                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {currentSponsor.isOnWaitlist && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Waitlist Position</h3>
                            <p className="font-medium">Position {currentSponsor.waitlistPosition}</p>
                          </div>
                        )}
                      </div>
                      
                      {currentSponsor.isActive && (
                        <div className="mt-6 pt-6 border-t">
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm">
                              Renew Campaign
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {currentSponsor.companyName} Campaign
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              currentSponsor.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {currentSponsor.isActive ? 'Active' : 'On Waitlist'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(currentSponsor.startDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(currentSponsor.endDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {currentSponsor.package === 'Premium' ? '$10,000' : '$5,000'} / week
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <AlertCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">Campaign Started</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Your ad campaign has been activated and is now live on our platform.
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDate(currentSponsor.startDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <BarChart className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">Weekly Performance Report</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Your weekly performance report is now available. View your metrics.
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                1 week ago
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <Download className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">Campaign Analytics Downloaded</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Your campaign analytics CSV file was downloaded.
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                2 weeks ago
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
