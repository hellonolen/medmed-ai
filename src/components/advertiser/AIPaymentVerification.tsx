
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, AlertCircle, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { aiService } from "@/services/AIService";

interface PaymentVerificationProps {
  paymentDetails: {
    amount: number;
    cardNumber?: string;
    paymentMethod: string;
    packageName: string;
    duration: number;
    isKnownCustomer?: boolean;
  };
  onVerificationComplete: (result: {
    verified: boolean;
    risk: "low" | "medium" | "high";
    reason: string;
  }) => void;
}

export const AIPaymentVerification: React.FC<PaymentVerificationProps> = ({
  paymentDetails,
  onVerificationComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    risk: "low" | "medium" | "high";
    reason: string;
  } | null>(null);

  React.useEffect(() => {
    verifyPayment();
  }, [paymentDetails]);

  const verifyPayment = async () => {
    setLoading(true);

    try {
      // Sanitize card number for security
      const sanitizedDetails = { ...paymentDetails };
      if (sanitizedDetails.cardNumber) {
        sanitizedDetails.cardNumber = sanitizedDetails.cardNumber.replace(/\d(?=\d{4})/g, "*");
      }

      // Add some context for better verification
      const contextEnhancedDetails = {
        ...sanitizedDetails,
        timestamp: new Date().toISOString(),
        averagePackagePrice: 999, // Fictional average for context
        requestIp: "Secure - Not shared with API" // Privacy note
      };

      const response = await aiService.getPaymentVerification(contextEnhancedDetails);

      if (response.success) {
        try {
          const result = JSON.parse(response.content);
          setVerificationResult(result);
          onVerificationComplete(result);
        } catch (parseError) {
          console.error("Error parsing verification result:", parseError);
          setVerificationResult({
            verified: false,
            risk: "high",
            reason: "Unable to verify payment due to processing error."
          });
          onVerificationComplete({
            verified: false,
            risk: "high",
            reason: "Unable to verify payment due to processing error."
          });
        }
      } else {
        setVerificationResult({
          verified: true, // Fallback to approval if service fails
          risk: "low",
          reason: "Automatic approval due to verification service unavailability."
        });
        onVerificationComplete({
          verified: true,
          risk: "low",
          reason: "Automatic approval due to verification service unavailability."
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      // Default to approval in case of error - don't block legitimate payments
      setVerificationResult({
        verified: true,
        risk: "low",
        reason: "Automatic approval due to verification service error."
      });
      onVerificationComplete({
        verified: true,
        risk: "low",
        reason: "Automatic approval due to verification service error."
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = () => {
    if (!verificationResult) return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
    
    if (!verificationResult.verified) {
      return <AlertCircle className="h-8 w-8 text-destructive" />;
    }
    
    switch (verificationResult.risk) {
      case "low":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "medium":
        return <AlertTriangle className="h-8 w-8 text-amber-500" />;
      case "high":
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <ShieldCheck className="h-8 w-8 text-primary" />;
    }
  };

  const getRiskColor = () => {
    if (!verificationResult) return "bg-gray-100";
    
    if (!verificationResult.verified) return "bg-red-50";
    
    switch (verificationResult.risk) {
      case "low":
        return "bg-green-50";
      case "medium":
        return "bg-amber-50";
      case "high":
        return "bg-red-50";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <Card className={`overflow-hidden ${getRiskColor()} transition-colors duration-300`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Payment Verification
        </CardTitle>
        <CardDescription>
          Our system verifies payment details for security
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {getRiskIcon()}
          </div>
          <div className="flex-grow">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <>
                <p className="font-medium">
                  {verificationResult?.verified 
                    ? `Payment Verified - ${verificationResult.risk.charAt(0).toUpperCase() + verificationResult.risk.slice(1)} Risk`
                    : "Verification Failed"}
                </p>
                <p className="text-sm text-gray-600">
                  {verificationResult?.reason}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
