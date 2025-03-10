
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PremiumFeaturePromptProps {
  featureName: string;
  description?: string;
}

export const PremiumFeaturePrompt = ({
  featureName,
  description = "This is a premium feature that requires a subscription."
}: PremiumFeaturePromptProps) => {
  return (
    <Card className="max-w-md mx-auto mt-8 border-2 border-primary/20">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
          <Lock className="text-primary h-6 w-6" />
        </div>
        <CardTitle className="text-xl flex items-center justify-center gap-2">
          Premium Feature <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
        </CardTitle>
        <CardDescription className="text-base mt-2">
          {featureName}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600">{description}</p>
        <div className="mt-6 bg-secondary/30 p-4 rounded-lg">
          <p className="text-sm font-medium">Upgrade to Premium to access:</p>
          <ul className="mt-2 text-sm space-y-1">
            <li>✓ Detailed medication information</li>
            <li>✓ Priority support</li>
            <li>✓ Exclusive health content</li>
            <li>✓ Detailed health reports</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Link to="/subscription">
          <Button className="w-full">
            Upgrade to Premium
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
