import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Clock, Star, Shield, LogOut, User, CreditCard, ArrowUpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';

/* ─── Plan meta ─────────────────────────────────────────────────────── */
const PLAN_INFO: Record<string, { label: string; price: string; seats: string; upgradesTo?: string }> = {
  free:       { label: 'Free (Trial)',  price: 'Free',     seats: '1 user',       upgradesTo: 'pro' },
  pro:        { label: 'Pro',           price: '$20/mo',   seats: '1 user',       upgradesTo: 'max' },
  max:        { label: 'Max',           price: '$100/mo',  seats: '1 user' },
  team:       { label: 'Team',          price: '$25/seat', seats: 'Per seat',     upgradesTo: 'enterprise' },
  enterprise: { label: 'Enterprise',    price: '$35/seat', seats: 'Per seat' },
};

const UserPortal = () => {
  const { tier, isSubscribed } = useSubscription();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const planInfo = PLAN_INFO[tier] || PLAN_INFO.free;
  const isTeamPlan = tier === 'team' || tier === 'enterprise';

  const handleSignOut = () => { signOut(); navigate('/'); };

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            {user && (
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <User className="h-3.5 w-3.5" /> {user.name ? `${user.name} · ` : ''}{user.email}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={tier === 'free' ? 'outline' : 'default'} className="capitalize">{planInfo.label}</Badge>
            {user && (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="plan" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plan">Plan & Billing</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* ─── Plan & Billing ─────────────────────────────────────── */}
          <TabsContent value="plan">
            <div className="grid gap-4">

              {/* Current plan card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-5 w-5 text-primary" /> Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 capitalize">{planInfo.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{planInfo.price} · {planInfo.seats}</p>
                    </div>
                    <Badge variant={isSubscribed ? 'default' : 'outline'} className="text-xs">
                      {isSubscribed ? 'Active' : 'Trial'}
                    </Badge>
                  </div>

                  {/* Team seat expansion */}
                  {isTeamPlan && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm font-semibold text-blue-800 mb-1">Need more seats?</p>
                      <p className="text-xs text-blue-600 mb-3">Add seats at any time. New seats are charged at your current per-seat rate.</p>
                      <Link to={`/checkout?plan=${tier}&seats=5`}>
                        <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                          <ArrowUpCircle className="h-3.5 w-3.5 mr-1.5" /> Add Seats
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Upgrade prompt for non-max plans */}
                  {planInfo.upgradesTo && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-800 mb-1">
                        Upgrade to {PLAN_INFO[planInfo.upgradesTo].label}
                      </p>
                      <p className="text-xs text-amber-700 mb-3">
                        Get more usage, more features, and priority access.
                      </p>
                      <Link to={`/checkout?plan=${planInfo.upgradesTo}`}>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                          <ArrowUpCircle className="h-3.5 w-3.5 mr-1.5" />
                          Upgrade to {PLAN_INFO[planInfo.upgradesTo].label}
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Free trial upgrade */}
                  {!isSubscribed && tier === 'free' && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Your 3-day trial</p>
                      <p className="text-xs text-gray-600 mb-3">Choose a paid plan to keep full access after your trial ends.</p>
                      <Link to="/pricing">
                        <Button size="sm"><ArrowUpCircle className="h-3.5 w-3.5 mr-1.5" /> View Plans</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-500">Your payment method is stored securely. We never store card details on our servers.</p>
                  {isSubscribed ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-gray-400">To update your card on file, re-enter payment through a plan checkout. Your existing subscription remains active.</p>
                      <Link to={`/checkout?plan=${tier}`}>
                        <Button variant="outline" size="sm">
                          <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Update Payment Method
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No payment method on file — you are on the free trial.</p>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* ─── Features ───────────────────────────────────────────── */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5 text-primary" /> Your Plan Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    { label: 'Symptom Checker', available: true },
                    { label: 'Pharmacy Finder', available: true },
                    { label: 'Interaction Checker', available: true },
                    { label: 'Live camera analysis', available: ['pro','max','team','enterprise'].includes(tier) },
                    { label: '45-second video analysis', available: ['pro','max','team','enterprise'].includes(tier) },
                    { label: 'Conversation history', available: ['pro','max','team','enterprise'].includes(tier) },
                    { label: '5× usage (Max)', available: ['max'].includes(tier) },
                    { label: 'Team seat management', available: ['team','enterprise'].includes(tier) },
                    { label: 'Admin controls', available: ['team','enterprise'].includes(tier) },
                  ].map(({ label, available }) => (
                    <li key={label} className={`flex items-center gap-2 text-sm ${available ? 'text-gray-700' : 'text-gray-300 line-through'}`}>
                      <span className={available ? 'text-green-500 font-bold' : 'text-gray-200'}>✓</span>
                      {label}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── History ────────────────────────────────────────────── */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-primary" /> Conversation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 italic">Your recent conversations will appear here.</p>
                <Link to="/history" className="inline-block mt-3">
                  <Button variant="outline" size="sm"><Star className="h-3.5 w-3.5 mr-1.5" /> View Full History</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserPortal;
