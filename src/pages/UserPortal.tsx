
import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Search, Clock, Star, Shield, ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const UserPortal = () => {
  const { tier, isSubscribed } = useSubscription();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Portal</h1>
            <p className="text-gray-500">Access your MedMed.AI features</p>
          </div>
          <Badge variant="outline" className="capitalize">
            {tier} Plan
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="searches">Search History</TabsTrigger>
            <TabsTrigger value="favorites">Saved Items</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Current Plan</dt>
                      <dd className="text-2xl font-bold text-primary capitalize">{tier}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-green-600">Active</dd>
                    </div>
                    {!isSubscribed && (
                      <div className="mt-4">
                        <Button 
                          variant="default" 
                          onClick={() => navigate('/subscription')}
                          className="w-full"
                        >
                          <ArrowUp className="mr-2 h-4 w-4" />
                          Upgrade to Premium
                        </Button>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Available Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {/* Free tier features */}
                    <li className="text-sm text-gray-600">✓ Basic medication search</li>
                    <li className="text-sm text-gray-600">✓ Basic AI support</li>
                    <li className="text-sm text-gray-600">✓ Pharmacy finder</li>
                    
                    {/* Premium tier features */}
                    <li className={`text-sm ${tier === 'free' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tier === 'free' ? '○' : '✓'} Detailed medication info
                    </li>
                    <li className={`text-sm ${tier === 'free' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tier === 'free' ? '○' : '✓'} Advanced search
                    </li>
                    
                    {/* Business tier features */}
                    <li className={`text-sm ${tier !== 'business' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tier !== 'business' ? '○' : '✓'} Priority support
                    </li>
                    <li className={`text-sm ${tier !== 'business' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tier !== 'business' ? '○' : '✓'} Specialist contacts
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-500 text-sm italic">
                    Your recent searches will appear here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="searches">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Search History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-500 text-sm italic">
                  Your search history will appear here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Saved Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-500 text-sm italic">
                  Your saved items will appear here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserPortal;
