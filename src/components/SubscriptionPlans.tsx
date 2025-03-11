
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Globe, FileText, MessageCircle, Star, Bot } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PlanFeature {
  name: string;
  included: boolean;
  icon?: React.ReactNode;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

export const SubscriptionPlans = () => {
  const { tier, toggleSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      priceValue: 0,
      description: 'Basic access to medication information',
      features: [
        { name: 'Basic medication search', included: true, icon: <Globe size={16} /> },
        { name: 'Smart health assistant', included: true, icon: <Bot size={16} /> },
        { name: 'Pharmacy finder', included: true, icon: <Globe size={16} /> },
        { name: 'Detailed medication information', included: false, icon: <Shield size={16} /> },
        { name: 'Personalized recommendations', included: false, icon: <Star size={16} /> },
        { name: 'Exclusive health content', included: false, icon: <FileText size={16} /> },
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99/mo',
      priceValue: 9.99,
      description: 'Enhanced access to health information',
      highlighted: true,
      features: [
        { name: 'All free features', included: true, icon: <Check size={16} /> },
        { name: 'Detailed medication information', included: true, icon: <Shield size={16} /> },
        { name: 'Advanced search history', included: true, icon: <Bot size={16} /> },
        { name: 'Enhanced recommendations', included: true, icon: <Star size={16} /> },
        { name: 'Exclusive health content', included: true, icon: <FileText size={16} /> },
        { name: 'Detailed health reports', included: true, icon: <FileText size={16} /> },
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: '$39.99/mo',
      priceValue: 39.99,
      description: 'Advanced healthcare solutions for professionals',
      features: [
        { name: 'All premium features', included: true, icon: <Check size={16} /> },
        { name: 'Performance analytics', included: true, icon: <Globe size={16} /> },
        { name: 'Batch medication lookups', included: true, icon: <FileText size={16} /> },
        { name: 'Specialist contact information', included: true, icon: <Star size={16} /> },
        { name: 'Professional health resources', included: true, icon: <FileText size={16} /> },
        { name: 'Priority response time', included: true, icon: <Bot size={16} /> },
      ]
    }
  ];

  const handleSubscribe = (plan: Plan) => {
    if (plan.id === 'free') {
      setIsProcessing(true);
      
      // Free plan doesn't need payment processing
      setTimeout(() => {
        toggleSubscription(plan.id as 'free' | 'premium' | 'business');
        setIsProcessing(false);
        toast.info("You've switched to the free plan.");
      }, 1000);
    } else {
      // Show payment dialog for paid plans
      setSelectedPlan(plan);
      setShowPaymentDialog(true);
    }
  };

  const handlePayment = () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing with Stripe/Whop
    setTimeout(() => {
      toggleSubscription(selectedPlan.id as 'free' | 'premium' | 'business');
      setIsProcessing(false);
      setShowPaymentDialog(false);
      
      toast.success(`You've successfully subscribed to the ${selectedPlan.name} plan!`);
    }, 1500);
  };

  const PaymentForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Card Information</h3>
        <div className="border rounded-md p-3 bg-white">
          <div className="h-10 flex items-center text-gray-400">
            Enter card details securely with Stripe...
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Billing Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-md p-3 bg-white">
            <div className="h-10 flex items-center text-gray-400">
              Name
            </div>
          </div>
          <div className="border rounded-md p-3 bg-white">
            <div className="h-10 flex items-center text-gray-400">
              Email
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full" 
        onClick={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : `Pay ${selectedPlan?.price}`}
      </Button>
      
      <div className="text-xs text-center text-gray-500 mt-4">
        Secure payments processed by Stripe. By subscribing, you agree to our Terms and Conditions.
      </div>
    </div>
  );

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
                {plan.priceValue > 0 && <span className="text-gray-500 text-sm"> /month</span>}
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
                className="w-full"
                disabled={plan.id === tier || isProcessing}
                onClick={() => handleSubscribe(plan)}
              >
                {isProcessing 
                  ? "Processing..." 
                  : plan.id === tier 
                    ? "Current Plan" 
                    : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              You will be charged {selectedPlan?.price} monthly
            </DialogDescription>
          </DialogHeader>
          <PaymentForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};
