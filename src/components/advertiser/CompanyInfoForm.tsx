
import React from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
            <Label htmlFor="description">
              Description * 
              <span className="text-xs text-gray-500 ml-2">
                (Up to {maxCharacters} characters)
              </span>
            </Label>
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
