
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Search, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const UserPortal = () => {
  const { tier, isSubscribed } = useSubscription();

  // Redirect non-subscribed users to subscription page
  if (!isSubscribed) {
    return <Navigate to="/subscription" replace />;
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Portal</h1>
            <p className="text-gray-500">Manage your {tier} subscription</p>
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
                      <dt className="text-sm font-medium text-gray-500">Plan</dt>
                      <dd className="text-2xl font-bold text-primary capitalize">{tier}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-green-600">Active</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="text-sm text-gray-600">✓ Detailed medication info</li>
                    <li className="text-sm text-gray-600">✓ Advanced search</li>
                    <li className="text-sm text-gray-600">✓ Specialist contacts</li>
                    {tier === 'business' && (
                      <li className="text-sm text-gray-600">✓ Priority support</li>
                    )}
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
