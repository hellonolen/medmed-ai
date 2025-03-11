
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/utils/formatUtils";
import { AdPackage } from "./AdPackageCard";

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPackage: string;
  durationWeeks: number;
  adPackages: AdPackage[];
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  onPayment: () => void;
  onWireTransferDetails: () => void;
}

const PaymentDialog = ({
  isOpen,
  onOpenChange,
  selectedPackage,
  durationWeeks,
  adPackages,
  paymentMethod,
  setPaymentMethod,
  onPayment,
  onWireTransferDetails
}: PaymentDialogProps) => {
  
  // Calculate total price based on package and duration
  const calculateTotalPrice = () => {
    const packagePrice = adPackages.find(p => p.id === selectedPackage)?.price || 0;
    return packagePrice * durationWeeks;
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            Select a payment method for your advertisement
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{adPackages.find(p => p.id === selectedPackage)?.name}</p>
                <p className="text-sm text-gray-500">{durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}</p>
              </div>
              <p className="font-bold">{formatCurrency(totalPrice)}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 p-2 rounded border border-gray-200 mb-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer flex-grow">
                    Credit/Debit Card
                    <p className="text-xs text-gray-500">Pay securely with your card</p>
                  </Label>
                </div>
                
                <div className={`flex items-center space-x-2 p-2 rounded border ${totalPrice >= 5000 ? 'border-gray-200' : 'border-gray-200 bg-gray-100'}`}>
                  <RadioGroupItem 
                    value="wire" 
                    id="wire" 
                    disabled={totalPrice < 5000}
                  />
                  <Label 
                    htmlFor="wire" 
                    className={`cursor-pointer flex-grow ${totalPrice < 5000 ? 'text-gray-400' : ''}`}
                  >
                    Wire Transfer
                    <p className="text-xs text-gray-500">Available for payments over $5,000</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {paymentMethod === "card" ? (
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
                
                <div className="text-xs text-gray-500 mt-2">
                  By proceeding with payment, you agree that no refunds will be provided once your advertisement is approved and published.
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-md text-sm">
                <p className="font-medium text-blue-700 mb-2">Wire Transfer Instructions</p>
                <p className="text-gray-700 mb-2">
                  You'll receive detailed wire transfer instructions via email. Your ad space will be reserved for 48 hours pending payment confirmation.
                </p>
                <p className="text-gray-700">
                  For wire transfers, please include your company name in the transfer reference.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {paymentMethod === "card" ? (
            <Button onClick={onPayment}>Pay Now</Button>
          ) : (
            <Button onClick={onWireTransferDetails}>Get Wire Transfer Details</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
