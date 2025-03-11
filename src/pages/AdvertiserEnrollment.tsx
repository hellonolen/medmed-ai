
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import CompanyInfoForm from "@/components/advertiser/CompanyInfoForm";
import AdPackageCard from "@/components/advertiser/AdPackageCard";
import DurationSelector from "@/components/advertiser/DurationSelector";
import PaymentDialog from "@/components/advertiser/PaymentDialog";
import { adPackages, MAX_DURATION_WEEKS } from "@/data/adPackages";

const AdvertiserEnrollment = () => {
  const { toast } = useToast();
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
    // Simulate payment processing and AI verification
    toast({
      title: "Payment successful!",
      description: "Your advertisement has been submitted for verification and will go live soon.",
    });
    setIsPaymentDialogOpen(false);
    
    // Simulate AI verification and email notification
    setTimeout(() => {
      toast({
        title: "Ad Verified",
        description: "Our AI has verified your advertisement and it is now live. You've been sent a confirmation email.",
      });
    }, 3000);
    
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
  };

  // Handle wire transfer selection
  const handleWireTransferDetails = () => {
    // Show wire transfer instructions for payments over $5000
    toast({
      title: "Wire Transfer Instructions Sent",
      description: "Check your email for wire transfer instructions. Your ad space will be reserved for 48 hours pending payment.",
    });
    setIsPaymentDialogOpen(false);
  };

  // Get the character limit based on selected package
  const getMaxCharacters = () => selectedPackage === "premium" ? 120 : 80;

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
