
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CompanyInfoForm from "@/components/advertiser/CompanyInfoForm";
import AdPackageCard from "@/components/advertiser/AdPackageCard";
import DurationSelector from "@/components/advertiser/DurationSelector";
import { adPackages, MAX_DURATION_WEEKS } from "@/data/adPackages";
import { useSponsor } from "@/contexts/SponsorContext";

const WORKER_URL =
  (import.meta as any).env?.VITE_WORKER_URL ||
  'https://medmed-agent.hellonolen.workers.dev';

const AdvertiserEnrollment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { registerSponsor } = useSponsor();

  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    contactEmail: "",
    website: "",
    logoFile: null as File | null
  });
  const [logoPreview, setLogoPreview] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({ ...prev, logoFile: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.description || !formData.contactEmail || !formData.logoFile || !selectedPackage) {
      toast({ title: "Missing information", description: "Please fill out all required fields and select an ad package", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate total price
      const pkg = adPackages.find(p => p.id === selectedPackage);
      const totalAmount = (pkg?.price || 0) * durationWeeks;
      const pkgName = pkg?.name || selectedPackage;

      // Attempt Stripe Checkout via Worker
      const stripeRes = await fetch(`${WORKER_URL}/api/stripe/sponsor-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          companyName: formData.companyName,
          packageName: pkgName,
          weeks: durationWeeks,
          customerEmail: formData.contactEmail,
          successUrl: `${window.location.origin}/sponsor-portal?payment=success`,
          cancelUrl: `${window.location.origin}/advertiser-enrollment`,
        }),
      });
      const stripeData: any = await stripeRes.json();

      if (stripeData.url) {
        // Register as a sponsor first (creates account in D1), then redirect to Stripe
        await registerSponsor({
          email: formData.contactEmail,
          password: crypto.randomUUID(), // Temporary password — they'll reset via email
          name: null,
          companyName: formData.companyName,
          package: selectedPackage === 'premium' ? 'Premium' : 'Standard',
        });
        // Redirect to Stripe Checkout
        window.location.href = stripeData.url;
        return;
      }

      // Fallback if Stripe not configured yet — register account and show success
      const success = await registerSponsor({
        email: formData.contactEmail,
        password: crypto.randomUUID(),
        name: null,
        companyName: formData.companyName,
        package: selectedPackage === 'premium' ? 'Premium' : 'Standard',
      });

      if (success) {
        toast({
          title: "Application submitted!",
          description: "Your sponsor account has been created. Our team will review and activate it shortly.",
        });
        setTimeout(() => navigate('/sponsor-portal'), 1500);
      } else {
        toast({ title: "Error", description: "Submission failed. Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMaxCharacters = () => 120;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="container px-4 py-8 mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Advertiser Enrollment</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Showcase your healthcare products or services to our engaged audience
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="md:col-span-2">
              <CompanyInfoForm
                formData={formData}
                onInputChange={handleInputChange}
                onLogoUpload={handleLogoUpload}
                logoPreview={logoPreview}
                selectedPackage={selectedPackage}
                onSubmit={handleSubmit}
                maxCharacters={getMaxCharacters()}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">Select Ad Package</h2>
              <div className="space-y-4">
                {adPackages.map(pkg => (
                  <AdPackageCard
                    key={pkg.id}
                    pkg={pkg}
                    isSelected={selectedPackage === pkg.id}
                    onSelect={setSelectedPackage}
                  />
                ))}

                {selectedPackage && (
                  <DurationSelector
                    selectedPackage={selectedPackage}
                    durationWeeks={durationWeeks}
                    setDurationWeeks={setDurationWeeks}
                    adPackages={adPackages}
                    maxDurationWeeks={MAX_DURATION_WEEKS}
                  />
                )}
              </div>
            </div>
          </div>

          {selectedPackage && (
            <div className="max-w-6xl mx-auto mt-8 flex justify-end">
              <Button type="submit" size="lg" disabled={isProcessing} className="min-w-48">
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </span>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdvertiserEnrollment;
