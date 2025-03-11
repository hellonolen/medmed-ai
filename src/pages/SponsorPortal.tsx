
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adPackages } from '@/data/adPackages';
import { BarChart, ExternalLink, LogIn, FileText } from 'lucide-react';
import { formatCurrency } from '@/utils/formatUtils';
import { useSponsor } from '@/contexts/SponsorContext';

const SponsorPortal = () => {
  const navigate = useNavigate();
  const { currentSponsor } = useSponsor();
  
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">MedMed.AI Sponsor Portal</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reach healthcare consumers directly with our targeted advertising solutions
          </p>
        </div>
        
        <Tabs defaultValue={currentSponsor ? "dashboard" : "packages"} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="mb-8">
              <TabsTrigger value="packages">Advertising Packages</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="dashboard">Sponsor Dashboard</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="packages" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {adPackages.map((pkg) => (
                <Card key={pkg.id} className={`border-l-4 ${pkg.id === "premium" ? "border-l-primary" : "border-l-gray-300"}`}>
                  <CardHeader>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="text-2xl font-bold text-primary mt-2">
                      {formatCurrency(pkg.price)}<span className="text-sm font-normal text-gray-500">/week</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={pkg.id === "premium" ? "default" : "outline"}
                      onClick={() => navigate('/advertiser-enrollment')}
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={() => navigate('/advertiser-enrollment')} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Apply to Advertise
              </Button>
              <Button variant="outline" onClick={() => navigate('/sponsor-login')} className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Existing Sponsor Login
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="benefits">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Targeted Audience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Reach healthcare consumers at the moment they're searching for medical information and solutions.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Access detailed analytics on impressions, clicks, and conversions through your sponsor dashboard.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brand Association</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Associate your brand with trusted medical information, enhancing credibility and trust.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="dashboard">
            {currentSponsor ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Sponsor Dashboard</CardTitle>
                  <CardDescription>
                    View your advertising performance metrics and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Button onClick={() => navigate('/sponsor-dashboard')} className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sponsor Login Required</CardTitle>
                  <CardDescription>
                    Please login to access your sponsor dashboard and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Button onClick={() => navigate('/sponsor-login')} className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sponsor Login
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 bg-muted/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Ready to become a sponsor?</h2>
          <p className="mb-4">
            Join our growing network of healthcare partners reaching thousands of users daily.
            For custom advertising solutions or questions, please contact our advertising team.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/advertiser-enrollment')}>
              Apply Now
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:sponsors@medmed.ai" className="flex items-center gap-2">
                Contact Advertising Team
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SponsorPortal;
