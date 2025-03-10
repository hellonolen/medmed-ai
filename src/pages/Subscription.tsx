
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { SponsoredContent } from "@/components/SponsoredContent";

const Subscription = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="container px-4 py-8 mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            MedMed.AI Premium
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock advanced features and detailed healthcare information with a MedMed.AI subscription
          </p>
        </div>
        
        <SubscriptionPlans />
        
        <div className="mt-16 mb-8">
          <SponsoredContent />
        </div>
        
        <div className="mt-12 bg-card/50 rounded-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-primary mb-4">Why Choose MedMed.AI Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Detailed Information</h3>
              <p className="text-gray-600">Access comprehensive details about medications, including side effects and interactions.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Advanced AI Support</h3>
              <p className="text-gray-600">Get more detailed responses from our AI system for your health questions.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Exclusive Content</h3>
              <p className="text-gray-600">Access premium articles and guides about healthcare topics.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Detailed Reports</h3>
              <p className="text-gray-600">Generate comprehensive reports about medications and health conditions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
