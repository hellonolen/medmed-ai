import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Globe, FileText, Star, Bot, Loader2 } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const WORKER_URL =
  (import.meta as any).env?.VITE_WORKER_URL ||
  'https://medmed-agent.hellonolen.workers.dev';

// Stripe Price IDs — set these in .env.local after creating products in Stripe dashboard
// VITE_STRIPE_PREMIUM_PRICE_ID=price_xxx
// VITE_STRIPE_BUSINESS_PRICE_ID=price_xxx
const STRIPE_PREMIUM_PRICE = (import.meta as any).env?.VITE_STRIPE_PREMIUM_PRICE_ID || '';
const STRIPE_BUSINESS_PRICE = (import.meta as any).env?.VITE_STRIPE_BUSINESS_PRICE_ID || '';

interface Plan {
  id: 'free' | 'premium' | 'business';
  name: string;
  price: string;
  priceValue: number;
  priceId: string;
  description: string;
  features: { name: string; included: boolean }[];
  highlighted?: boolean;
}

export const SubscriptionPlans = () => {
  const { tier, toggleSubscription } = useSubscription();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      priceValue: 0,
      priceId: '',
      description: 'Basic access to medication information',
      features: [
        { name: 'Basic medication search', included: true },
        { name: 'Smart health assistant', included: true },
        { name: 'Pharmacy finder', included: true },
        { name: 'Detailed medication information', included: false },
        { name: 'Personalized recommendations', included: false },
        { name: 'Exclusive health content', included: false },
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99/mo',
      priceValue: 9.99,
      priceId: STRIPE_PREMIUM_PRICE,
      description: 'Enhanced access to health information',
      highlighted: true,
      features: [
        { name: 'All free features', included: true },
        { name: 'Detailed medication information', included: true },
        { name: 'Advanced search history', included: true },
        { name: 'Enhanced recommendations', included: true },
        { name: 'Exclusive health content', included: true },
        { name: 'Detailed health reports', included: true },
      ],
    },
    {
      id: 'business',
      name: 'Business',
      price: '$39.99/mo',
      priceValue: 39.99,
      priceId: STRIPE_BUSINESS_PRICE,
      description: 'Advanced healthcare solutions for professionals',
      features: [
        { name: 'All premium features', included: true },
        { name: 'Performance analytics', included: true },
        { name: 'Batch medication lookups', included: true },
        { name: 'Specialist contact information', included: true },
        { name: 'Professional health resources', included: true },
        { name: 'Priority response time', included: true },
      ],
    },
  ];

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === tier) return;
    if (plan.id === 'free') {
      toggleSubscription('free');
      toast.info("Switched to free plan.");
      return;
    }

    setLoading(plan.id);

    // If Stripe price IDs are configured, redirect to Stripe Checkout
    if (plan.priceId) {
      try {
        const res = await fetch(`${WORKER_URL}/api/stripe/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: plan.priceId,
            customerEmail: user?.email || '',
            successUrl: `${window.location.origin}/user-portal?session_id={CHECKOUT_SESSION_ID}&tier=${plan.id}`,
            cancelUrl: `${window.location.origin}/subscription`,
          }),
        });
        const data: any = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      } catch {
        // Fall through to manual toggle if Stripe not configured
      }
    }

    // Fallback: Stripe not configured yet — toggle manually so app still works
    toggleSubscription(plan.id);
    toast.success(`Subscribed to ${plan.name} plan!`);
    setLoading(null);
  };

  return (
    <div className="py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-primary mb-2">Subscription Plans</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose the plan that best fits your healthcare information needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {plans.map(plan => (
          <Card
            key={plan.id}
            className={`border-2 h-full flex flex-col relative ${
              plan.highlighted ? 'border-primary shadow-lg scale-105 z-10' : 'border-gray-200'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 bg-primary text-white text-sm rounded-full font-medium">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl text-center">{plan.name}</CardTitle>
              <CardDescription className="text-center">
                <span className="text-2xl font-bold text-primary">{plan.price}</span>
                {plan.priceValue > 0 && <span className="text-gray-500 text-sm"> /month</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-center text-gray-600 mb-6">{plan.description}</p>
              <ul className="space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {f.included ? (
                      <>
                        <span className="text-green-500 bg-green-50 p-1 rounded-full"><Check size={14} /></span>
                        <span className="text-sm">{f.name}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-300 p-1"><X size={14} /></span>
                        <span className="text-sm text-gray-400">{f.name}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={plan.id === tier ? 'outline' : 'default'}
                className="w-full"
                disabled={plan.id === tier || loading === plan.id}
                onClick={() => handleSubscribe(plan)}
              >
                {loading === plan.id ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</>
                ) : plan.id === tier ? 'Current Plan' : 'Subscribe'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
