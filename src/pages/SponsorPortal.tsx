
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adPackages, PREMIUM_SLOTS, STANDARD_SLOTS } from '@/data/adPackages';
import { Award, BarChart, LogIn, BadgeCheck, TrendingUp, AlertCircle, Users } from 'lucide-react';
import { formatCurrency } from '@/utils/formatUtils';
import { useSponsor } from '@/contexts/SponsorContext';

const SponsorPortal = () => {
  const navigate = useNavigate();
  const { 
    currentSponsor, 
    availableSlots, 
    waitlistedSponsors 
  } = useSponsor();
  
  // Get waitlist length by package type
  const premiumWaitlistLength = waitlistedSponsors.filter(s => s.package === 'Premium').length;
  const standardWaitlistLength = waitlistedSponsors.filter(s => s.package === 'Standard').length;
  
  // Check if current sponsor is on waitlist
  const isOnWaitlist = currentSponsor?.isOnWaitlist || false;
  const waitlistPosition = currentSponsor?.waitlistPosition || 0;
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Partner with MedMed.AI
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto text-sm">
            Reach healthcare consumers directly with our targeted advertising solutions
          </p>
        </div>
        
        {isOnWaitlist && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-800">You're on the Waitlist</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Your {currentSponsor?.package} ad is at position {waitlistPosition} in the queue. 
                    We'll notify you when your ad goes live.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="mb-6">
          <CardHeader className="py-4 px-6">
            <CardTitle className="text-lg">Current Availability</CardTitle>
            <CardDescription>
              We partner with a limited number of healthcare providers
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Premium Slots</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-sm">
                      <span className="font-medium">{availableSlots.premium}</span> of {PREMIUM_SLOTS} available
                    </div>
                    {availableSlots.premium === 0 && (
                      <div className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        <span>{premiumWaitlistLength} waiting</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <BadgeCheck className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium">Standard Slots</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-sm">
                      <span className="font-medium">{availableSlots.standard}</span> of {STANDARD_SLOTS} available
                    </div>
                    {availableSlots.standard === 0 && (
                      <div className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        <span>{standardWaitlistLength} waiting</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue={currentSponsor ? "dashboard" : "packages"} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="mb-4 bg-secondary/80 p-1">
              <TabsTrigger value="packages" className="text-xs px-3 py-1.5">
                Ad Packages
              </TabsTrigger>
              <TabsTrigger value="benefits" className="text-xs px-3 py-1.5">
                Benefits
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="text-xs px-3 py-1.5">
                Dashboard
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="packages" className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adPackages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`overflow-hidden transition-all duration-200 hover:shadow-sm ${
                    pkg.id === "premium" 
                      ? "border-primary/20 bg-gradient-to-b from-white to-purple-50/30" 
                      : "border"
                  }`}
                >
                  {pkg.id === "premium" && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full flex items-center">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        Top Row
                      </span>
                    </div>
                  )}
                  <CardHeader className="py-4 px-4">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription className="text-sm">{pkg.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(pkg.price)}
                      </span>
                      <span className="text-xs font-normal text-gray-500 ml-1">/week</span>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <ul className="space-y-2 text-sm">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Availability status */}
                    <div className="mt-4 text-sm">
                      <div className={`flex items-center ${
                        (pkg.id === "premium" && availableSlots.premium === 0) || 
                        (pkg.id === "standard" && availableSlots.standard === 0) 
                          ? "text-amber-600" 
                          : "text-green-600"
                      }`}>
                        <span className="h-2 w-2 rounded-full mr-2 bg-current"></span>
                        {(pkg.id === "premium" && availableSlots.premium > 0) || 
                         (pkg.id === "standard" && availableSlots.standard > 0) 
                          ? "Slots Available" 
                          : "Waitlist Only"}
                      </div>
                      
                      {/* If waitlist, show estimated wait time */}
                      {((pkg.id === "premium" && availableSlots.premium === 0) || 
                        (pkg.id === "standard" && availableSlots.standard === 0)) && (
                        <div className="text-xs text-gray-500 mt-1">
                          Est. wait: {pkg.id === "premium" ? premiumWaitlistLength : standardWaitlistLength} {
                            (pkg.id === "premium" ? premiumWaitlistLength : standardWaitlistLength) === 1 
                              ? "sponsor" 
                              : "sponsors"
                          } ahead
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="py-3 px-4">
                    <Button 
                      className="w-full text-sm" 
                      variant={pkg.id === "premium" ? "default" : "outline"}
                      onClick={() => navigate('/advertiser-enrollment')}
                      size="sm"
                    >
                      {((pkg.id === "premium" && availableSlots.premium === 0) || 
                        (pkg.id === "standard" && availableSlots.standard === 0)) 
                        ? "Join Waitlist" 
                        : "Get Started"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="benefits" className="animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border hover:shadow-sm transition-all">
                <CardHeader className="py-3 px-4">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Targeted Audience</CardTitle>
                </CardHeader>
                <CardContent className="py-1 px-4">
                  <p className="text-gray-600 text-sm">
                    Reach healthcare consumers at the moment they're searching for medical information.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border hover:shadow-sm transition-all">
                <CardHeader className="py-3 px-4">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                    <BarChart className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Analytics</CardTitle>
                </CardHeader>
                <CardContent className="py-1 px-4">
                  <p className="text-gray-600 text-sm">
                    Access detailed metrics on impressions, clicks, and conversions through your dashboard.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border hover:shadow-sm transition-all">
                <CardHeader className="py-3 px-4">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Brand Association</CardTitle>
                </CardHeader>
                <CardContent className="py-1 px-4">
                  <p className="text-gray-600 text-sm">
                    Associate your brand with trusted medical information, enhancing credibility.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="dashboard" className="animate-in fade-in-50 duration-300">
            {currentSponsor ? (
              <Card className="border shadow-sm hover:shadow-md transition-all">
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Your Sponsor Dashboard</CardTitle>
                  <CardDescription className="text-sm">
                    View your advertising performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <Button 
                    onClick={() => navigate('/sponsor-dashboard')} 
                    className="flex items-center gap-1"
                    size="sm"
                  >
                    <BarChart className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border shadow-sm bg-gray-50/50">
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Partner Login Required</CardTitle>
                  <CardDescription className="text-sm">
                    Please login to access your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <Button 
                    onClick={() => navigate('/sponsor-login')} 
                    className="flex items-center gap-1"
                    size="sm"
                  >
                    <LogIn className="h-4 w-4" />
                    Partner Login
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SponsorPortal;
