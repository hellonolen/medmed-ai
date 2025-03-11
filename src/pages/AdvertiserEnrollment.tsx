
import { useState } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CompanyInfoForm from "@/components/advertiser/CompanyInfoForm";
import AdPackageCard from "@/components/advertiser/AdPackageCard";
import DurationSelector from "@/components/advertiser/DurationSelector";
import PaymentDialog from "@/components/advertiser/PaymentDialog";
import { adPackages, MAX_DURATION_WEEKS } from "@/data/adPackages";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useSponsor } from "@/contexts/SponsorContext";

const AdvertiserEnrollment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { availableSlots, joinWaitlist } = useSponsor();
  
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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const isPremiumSelected = selectedPackage === "premium";
  const isStandardSelected = selectedPackage === "standard";
  
  // Check if selected package is full
  const isPremiumFull = isPremiumSelected && availableSlots.premium === 0;
  const isStandardFull = isStandardSelected && availableSlots.standard === 0;
  const isSelectedPackageFull = isPremiumFull || isStandardFull;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({
        ...prev,
        logoFile: file
      }));
      
      // Create a preview URL for the uploaded image
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.companyName || !formData.description || !formData.contactEmail || !formData.logoFile || !selectedPackage) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields and select an ad package",
        variant: "destructive"
      });
      return;
    }
    
    // Open payment dialog
    setIsPaymentDialogOpen(true);
  };

  const handlePayment = () => {
    // Determine if we're adding to active sponsors or waitlist
    if (isSelectedPackageFull) {
      // Add to waitlist
      const newSponsor = {
        id: `sponsor-${Date.now()}`,
        name: "New Sponsor",
        email: formData.contactEmail,
        companyName: formData.companyName,
        package: isPremiumSelected ? 'Premium' : 'Standard' as 'Premium' | 'Standard',
        apiKey: `sk_${formData.companyName.toLowerCase().replace(/\s+/g, '')}_${Date.now()}`,
        isActive: false,
        isOnWaitlist: true
      };
      
      joinWaitlist(newSponsor);
      
      toast({
        title: "Added to Waitlist",
        description: "All slots are currently filled. You've been added to the waitlist and will be notified when a slot becomes available.",
      });
    } else {
      // Regular sponsor activation
      toast({
        title: "Payment successful!",
        description: "Your advertisement has been submitted for verification and will go live soon.",
      });
      
      // Simulate AI verification and email notification
      setTimeout(() => {
        toast({
          title: "Ad Verified",
          description: "Our AI has verified your advertisement and it is now live. You've been sent a confirmation email.",
        });
      }, 3000);
    }
    
    setIsPaymentDialogOpen(false);
    
    // Reset form
    setFormData({
      companyName: "",
      description: "",
      contactEmail: "",
      website: "",
      logoFile: null
    });
    setLogoPreview("");
    setSelectedPackage("");
    setDurationWeeks(1);
    setPaymentMethod("card");
    
    // Redirect to sponsor portal
    setTimeout(() => {
      navigate('/sponsor-portal');
    }, 2000);
  };

  // Handle wire transfer selection
  const handleWireTransferDetails = () => {
    // Show wire transfer instructions for payments over $5000
    toast({
      title: "Wire Transfer Instructions Sent",
      description: "Check your email for wire transfer instructions. Your ad space will be reserved for 48 hours pending payment.",
    });
    setIsPaymentDialogOpen(false);
    
    // Redirect to sponsor portal
    setTimeout(() => {
      navigate('/sponsor-portal');
    }, 2000);
  };

  // Get the character limit based on selected package - identical for both packages now
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
          <h1 className="text-4xl font-bold text-primary mb-4">
            Advertiser Enrollment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Showcase your healthcare products or services to our engaged audience
          </p>
        </div>
        
        {/* Availability alerts */}
        {selectedPackage && isSelectedPackageFull && (
          <Alert className="bg-amber-50 border-amber-200 mb-6">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">All {isPremiumSelected ? "Premium" : "Standard"} slots are filled</AlertTitle>
            <AlertDescription className="text-amber-700">
              You can still proceed with enrollment and join the waitlist. You'll be automatically promoted when a slot becomes available.
            </AlertDescription>
          </Alert>
        )}
        
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
              
              {/* Package availability info */}
              {selectedPackage && (
                <div className="text-sm mt-2">
                  <div className={`flex items-center ${
                    isSelectedPackageFull ? "text-amber-600" : "text-green-600"
                  }`}>
                    <span className="h-2 w-2 rounded-full mr-2 bg-current"></span>
                    {isSelectedPackageFull 
                      ? `${isPremiumSelected ? "Premium" : "Standard"} - Waitlist Only` 
                      : `${isPremiumSelected ? "Premium" : "Standard"} - Slots Available`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        selectedPackage={selectedPackage}
        durationWeeks={durationWeeks}
        adPackages={adPackages}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onPayment={handlePayment}
        onWireTransferDetails={handleWireTransferDetails}
      />
    </div>
  );
};

export default AdvertiserEnrollment;
