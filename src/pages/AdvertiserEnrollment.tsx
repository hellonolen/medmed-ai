
import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const adPackages = [
  {
    id: "standard",
    name: "Standard Ad Package",
    price: "$5,000",
    duration: "1 week",
    description: "Your brand featured in our partners section",
    features: [
      "Standard position in partners section",
      "Up to 80 characters description",
      "Basic analytics dashboard",
      "Weekly performance report"
    ]
  },
  {
    id: "premium",
    name: "Premium Ad Package",
    price: "$10,000",
    duration: "1 week",
    description: "Premium placement with enhanced visibility",
    features: [
      "Top position in partners section",
      "Up to 120 characters description",
      "Priority placement for maximum visibility",
      "Advanced analytics dashboard",
      "Daily performance metrics"
    ]
  }
];

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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

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
    // Simulate payment processing
    toast({
      title: "Payment successful!",
      description: "Your advertisement has been submitted for review.",
    });
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
  };

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
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Provide details about your company for the advertisement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input 
                      id="companyName" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Your company name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description * 
                      <span className="text-xs text-gray-500 ml-2">
                        ({selectedPackage === "premium" ? "Up to 120" : "Up to 80"} characters)
                      </span>
                    </Label>
                    <Input 
                      id="description" 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of your company or service"
                      maxLength={selectedPackage === "premium" ? 120 : 80}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input 
                      id="contactEmail" 
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="contact@company.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL *</Label>
                    <Input 
                      id="website" 
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourcompany.com"
                      required
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo">Company Logo *</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/70 transition-colors"
                        onClick={() => document.getElementById("logo")?.click()}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload logo</p>
                        <p className="text-xs text-gray-400">PNG, JPG or SVG (max 2MB)</p>
                        <Input 
                          id="logo" 
                          type="file"
                          className="hidden"
                          accept="image/png, image/jpeg, image/svg+xml"
                          onChange={handleLogoUpload}
                        />
                      </div>
                      
                      {logoPreview && (
                        <div className="h-20 w-20 relative border rounded-md overflow-hidden">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={!selectedPackage}>
                    Continue to Payment
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">Select Ad Package</h2>
            <div className="space-y-4">
              {adPackages.map(pkg => (
                <Card 
                  key={pkg.id}
                  className={`cursor-pointer transition-all ${selectedPackage === pkg.id ? 'border-primary/70 shadow-md' : 'hover:border-gray-300'}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{pkg.name}</h3>
                      <div className="text-primary font-bold">{pkg.price}</div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{pkg.duration}</p>
                    <p className="text-sm mt-2">{pkg.description}</p>
                    
                    <ul className="mt-3 space-y-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start">
                          <span className="text-primary mr-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-4">
                      <Button 
                        variant={selectedPackage === pkg.id ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedPackage(pkg.id)}
                      >
                        {selectedPackage === pkg.id ? "Selected" : "Select package"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
            <DialogDescription>
              Secure payment via Stripe and Whop
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{adPackages.find(p => p.id === selectedPackage)?.name}</p>
                  <p className="text-sm text-gray-500">{adPackages.find(p => p.id === selectedPackage)?.duration}</p>
                </div>
                <p className="font-bold">{adPackages.find(p => p.id === selectedPackage)?.price}</p>
              </div>
            </div>
            
            {/* Payment form would go here - using a simplified version for demo purposes */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="4242 4242 4242 4242" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="expiry">Expiration Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePayment}>Pay Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvertiserEnrollment;
