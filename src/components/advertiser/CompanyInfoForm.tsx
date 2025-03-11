
import React, { useState } from "react";
import { Upload, Wand } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { aiService } from "@/services/AIService";
import { toast } from "sonner";

export interface CompanyFormData {
  companyName: string;
  description: string;
  contactEmail: string;
  website: string;
  logoFile: File | null;
}

interface CompanyInfoFormProps {
  formData: CompanyFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  logoPreview: string;
  selectedPackage: string;
  onSubmit: (e: React.FormEvent) => void;
  maxCharacters: number;
}

const CompanyInfoForm = ({
  formData,
  onInputChange,
  onLogoUpload,
  logoPreview,
  selectedPackage,
  onSubmit,
  maxCharacters
}: CompanyInfoFormProps) => {
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [improvingDescription, setImprovingDescription] = useState(false);
  
  // Get AI suggestion for description based on company name and website
  const getDescriptionSuggestion = async () => {
    if (!formData.companyName && !formData.website) {
      toast.error("Please enter company name or website first");
      return;
    }
    
    setLoadingSuggestion(true);
    
    try {
      const response = await aiService.askAI({
        query: `Generate a concise, professional description for this company: Name: ${formData.companyName || "Unknown"}. Website: ${formData.website || "Not provided"}.`,
        systemPrompt: `You are an advertising copywriter. Generate a compelling, concise company description in under ${maxCharacters} characters. Focus on value proposition, unique selling points, and professional tone. Do not use placeholder text. If website is provided, base description on the typical services of this type of business.`
      });
      
      if (response.success) {
        setSuggestion(response.content);
      } else {
        toast.error("Failed to generate suggestion");
      }
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("Failed to generate suggestion");
    } finally {
      setLoadingSuggestion(false);
    }
  };
  
  // Improve existing description with AI
  const improveDescription = async () => {
    if (!formData.description) {
      toast.error("Please enter a description first");
      return;
    }
    
    setImprovingDescription(true);
    
    try {
      const response = await aiService.askAI({
        query: `Improve this company description: "${formData.description}"`,
        systemPrompt: `You are an advertising copywriter. Improve this company description while keeping it under ${maxCharacters} characters. Make it more compelling, clear, and professional. Return ONLY the improved text without commentary.`
      });
      
      if (response.success) {
        // Create a synthetic event to update the description
        const event = {
          target: {
            name: "description",
            value: response.content
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onInputChange(event);
        toast.success("Description improved!");
      } else {
        toast.error("Failed to improve description");
      }
    } catch (error) {
      console.error("Error improving description:", error);
      toast.error("Failed to improve description");
    } finally {
      setImprovingDescription(false);
    }
  };
  
  // Apply suggestion to the form
  const applySuggestion = () => {
    if (!suggestion) return;
    
    // Create a synthetic event to update the description
    const event = {
      target: {
        name: "description",
        value: suggestion
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(event);
    setSuggestion("");
  };

  return (
    <form onSubmit={onSubmit}>
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
              onChange={onInputChange}
              placeholder="Your company name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">
                Description * 
                <span className="text-xs text-gray-500 ml-2">
                  (Up to {maxCharacters} characters)
                </span>
              </Label>
              <div className="flex gap-2">
                {formData.description && (
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2 text-xs"
                    onClick={improveDescription}
                    disabled={improvingDescription}
                  >
                    <Wand className="h-3 w-3 mr-1" />
                    {improvingDescription ? "Improving..." : "Improve Text"}
                  </Button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-2 text-xs"
                      onClick={getDescriptionSuggestion}
                      disabled={loadingSuggestion}
                    >
                      <Wand className="h-3 w-3 mr-1" />
                      {loadingSuggestion ? "Generating..." : "AI Suggestion"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-4" align="end">
                    {suggestion ? (
                      <>
                        <p className="text-sm font-medium mb-2">AI Suggested Description:</p>
                        <p className="text-sm text-gray-700 mb-3">{suggestion}</p>
                        <div className="flex justify-end">
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="default" 
                            onClick={applySuggestion}
                          >
                            Use This
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Click "AI Suggestion" to generate a description based on your company details.
                      </p>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Input 
              id="description" 
              name="description"
              value={formData.description}
              onChange={onInputChange}
              placeholder="Brief description of your company or service"
              maxLength={maxCharacters}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
                  onChange={onLogoUpload}
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
            <p className="text-xs text-gray-500 mt-2">
              Note: If there are any issues with your logo, our AI will use your company name as a text logo instead.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!selectedPackage}>
            Continue to Payment
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CompanyInfoForm;
