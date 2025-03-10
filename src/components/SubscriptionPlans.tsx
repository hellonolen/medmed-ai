
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Globe, Clock, FileText, MessageSquare, Star } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

interface PlanFeature {
  name: string;
  included: boolean;
  icon?: React.ReactNode;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

export const SubscriptionPlans = () => {
  const { tier, toggleSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Basic access to medication information',
      features: [
        { name: 'Basic medication search', included: true, icon: <Globe size={16} /> },
        { name: 'Symptom checker', included: true, icon: <Clock size={16} /> },
        { name: 'Pharmacy finder', included: true, icon: <Globe size={16} /> },
        { name: 'Detailed medication information', included: false, icon: <Shield size={16} /> },
        { name: 'Priority support', included: false, icon: <MessageSquare size={16} /> },
        { name: 'Exclusive health content', included: false, icon: <FileText size={16} /> },
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$4.99/mo',
      description: 'Enhanced medication information and features',
      features: [
        { name: 'All free features', included: true, icon: <Check size={16} /> },
        { name: 'Detailed medication information', included: true, icon: <Shield size={16} /> },
        { name: 'Ad-free experience', included: true, icon: <Shield size={16} /> },
        { name: 'Unlimited search history', included: true, icon: <Clock size={16} /> },
        { name: 'Priority support', included: false, icon: <MessageSquare size={16} /> },
        { name: 'Exclusive health content', included: false, icon: <FileText size={16} /> },
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99/mo',
      description: 'Complete access to all features',
      highlighted: true,
      features: [
        { name: 'All basic features', included: true, icon: <Check size={16} /> },
        { name: 'Priority support', included: true, icon: <MessageSquare size={16} /> },
        { name: 'Exclusive health content', included: true, icon: <FileText size={16} /> },
        { name: 'Detailed health reports', included: true, icon: <FileText size={16} /> },
        { name: 'Medication reminder alerts', included: true, icon: <Clock size={16} /> },
        { name: 'Personalized recommendations', included: true, icon: <Star size={16} /> },
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Contact us',
      description: 'Custom healthcare solutions for organizations',
      features: [
        { name: 'All premium features', included: true, icon: <Check size={16} /> },
        { name: 'Custom integration', included: true, icon: <Shield size={16} /> },
        { name: 'API access', included: true, icon: <Globe size={16} /> },
        { name: 'Dedicated account manager', included: true, icon: <MessageSquare size={16} /> },
        { name: 'Usage analytics', included: true, icon: <FileText size={16} /> },
        { name: 'Specialist contact information', included: true, icon: <Star size={16} /> },
      ]
    }
  ];

  const handleSubscribe = (planId: string) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toggleSubscription(planId as 'free' | 'basic' | 'premium' | 'enterprise');
      setIsProcessing(false);
      
      if (planId !== 'free') {
        toast.success(`You've successfully subscribed to the ${planId} plan!`);
      } else {
        toast.info("You've switched to the free plan.");
      }
    }, 1500);
  };

  return (
    <div className="py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-primary mb-2">Subscription Plans</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose the plan that best fits your healthcare information needs
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {plans.map(plan => (
          <Card 
            key={plan.id}
            className={`border-2 h-full flex flex-col ${
              plan.highlighted 
                ? 'border-primary shadow-lg scale-105 relative z-10' 
                : 'border-gray-200'
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
                {plan.id !== 'enterprise' && <span className="text-gray-500 text-sm"> /month</span>}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <p className="text-center text-gray-600 mb-6">{plan.description}</p>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {feature.included ? (
                      <>
                        <span className="text-green-500 bg-green-50 p-1 rounded-full">{feature.icon || <Check size={16} />}</span>
                        <span className="text-sm">{feature.name}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-300 p-1"><X size={16} /></span>
                        <span className="text-sm text-gray-400">{feature.name}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                variant={plan.id === tier ? "outline" : "default"}
                className={`w-full ${plan.highlighted ? '' : ''}`}
                disabled={plan.id === tier || isProcessing}
                onClick={() => handleSubscribe(plan.id)}
              >
                {isProcessing 
                  ? "Processing..." 
                  : plan.id === tier 
                    ? "Current Plan" 
                    : plan.id === 'enterprise' 
                      ? "Contact Sales" 
                      : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
