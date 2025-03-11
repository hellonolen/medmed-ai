
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adPackages } from '@/data/adPackages';
import { Award, BarChart, ExternalLink, LogIn, FileText, BadgeCheck, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/formatUtils';
import { useSponsor } from '@/contexts/SponsorContext';

const SponsorPortal = () => {
  const navigate = useNavigate();
  const { currentSponsor } = useSponsor();
  
  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4 text-primary">
            <Award className="h-10 w-10 mr-2" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Partner with MedMed.AI
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Reach healthcare consumers directly with our targeted advertising solutions
          </p>
        </div>
        
        <Tabs defaultValue={currentSponsor ? "dashboard" : "packages"} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="mb-6 bg-secondary/80 p-1">
              <TabsTrigger value="packages" className="text-sm px-4 py-2">
                Advertising Packages
              </TabsTrigger>
              <TabsTrigger value="benefits" className="text-sm px-4 py-2">
                Benefits
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="text-sm px-4 py-2">
                Sponsor Dashboard
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="packages" className="space-y-8 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {adPackages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
                    pkg.id === "premium" 
                      ? "border-primary/30 relative bg-gradient-to-b from-white to-purple-50" 
                      : "border hover:border-gray-300"
                  }`}
                >
                  {pkg.id === "premium" && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full flex items-center">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        Recommended
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription className="text-base">{pkg.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-primary">
                        {formatCurrency(pkg.price)}
                      </span>
                      <span className="text-sm font-normal text-gray-500 ml-1">/week</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={pkg.id === "premium" ? "default" : "outline"}
                      onClick={() => navigate('/advertiser-enrollment')}
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
              <Button 
                onClick={() => navigate('/advertiser-enrollment')} 
                className="flex items-center gap-2"
                size="lg"
              >
                <FileText className="h-4 w-4" />
                Apply to Advertise
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/sponsor-login')} 
                className="flex items-center gap-2"
                size="lg"
              >
                <LogIn className="h-4 w-4" />
                Existing Partner Login
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="benefits" className="animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Targeted Audience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Reach healthcare consumers at the moment they're searching for medical information and solutions.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Access detailed analytics on impressions, clicks, and conversions through your sponsor dashboard.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BadgeCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Brand Association</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Associate your brand with trusted medical information, enhancing credibility and trust.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="dashboard" className="animate-in fade-in-50 duration-300">
            {currentSponsor ? (
              <Card className="border shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-2xl">Your Sponsor Dashboard</CardTitle>
                  <CardDescription className="text-base">
                    View your advertising performance metrics and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <Button 
                    onClick={() => navigate('/sponsor-dashboard')} 
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <BarChart className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border shadow-sm bg-gray-50/50">
                <CardHeader>
                  <CardTitle className="text-2xl">Partner Login Required</CardTitle>
                  <CardDescription className="text-base">
                    Please login to access your sponsor dashboard and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <Button 
                    onClick={() => navigate('/sponsor-login')} 
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <LogIn className="h-4 w-4" />
                    Partner Login
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-16 bg-secondary/50 p-8 rounded-xl border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Ready to become a sponsor?</h2>
            <p className="mb-6 text-gray-600">
              Join our growing network of healthcare partners reaching thousands of users daily.
              For custom advertising solutions or questions, please contact our advertising team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/advertiser-enrollment')}
                size="lg"
                className="flex-1"
              >
                Apply Now
              </Button>
              <Button 
                variant="outline" 
                asChild
                size="lg"
                className="flex-1"
              >
                <a href="mailto:sponsors@medmed.ai" className="flex items-center justify-center gap-2">
                  Contact Advertising Team
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SponsorPortal;
