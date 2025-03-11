
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface SponsorProps {
  name: string;
  description: string;
  logo: string;
  link: string;
  isPremium?: boolean;
}

export const SponsoredContent = () => {
  // Sponsors data with premium and standard sponsors clearly separated
  const premiumSponsors: SponsorProps[] = [
    {
      name: "HealthPlus Pharmacy",
      description: "Your trusted partner for all medication needs with locations nationwide.",
      logo: "https://placehold.co/100x40/4F46E5/FFFFFF?text=HealthPlus",
      link: "#",
      isPremium: true
    },
    {
      name: "MediCare Telehealth",
      description: "Connect with licensed doctors online in minutes, 24/7 availability.",
      logo: "https://placehold.co/100x40/3B82F6/FFFFFF?text=MediCare",
      link: "#",
      isPremium: true
    },
    {
      name: "WellLife Insurance",
      description: "Health insurance plans for individuals and families at affordable rates.",
      logo: "https://placehold.co/100x40/10B981/FFFFFF?text=WellLife",
      link: "#",
      isPremium: true
    }
  ];
  
  const standardSponsors: SponsorProps[] = [
    {
      name: "NutriHealth Supplements",
      description: "Science-backed nutritional supplements for optimal health and wellness.",
      logo: "https://placehold.co/100x40/EC4899/FFFFFF?text=NutriHealth",
      link: "#"
    },
    {
      name: "MindWell Therapy",
      description: "Online mental health services and resources for better wellbeing.",
      logo: "https://placehold.co/100x40/8B5CF6/FFFFFF?text=MindWell",
      link: "#"
    },
    {
      name: "FitTrack Devices",
      description: "Smart health monitoring devices to track your fitness and vitals.",
      logo: "https://placehold.co/100x40/F59E0B/FFFFFF?text=FitTrack",
      link: "#"
    }
  ];

  return (
    <div className="py-8 bg-gray-50/70">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-primary mb-2">Our Healthcare Partners</h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm">
            We collaborate with trusted healthcare providers to bring you the best services
          </p>
          <div className="flex justify-center mt-2">
            <Link to="/sponsor-portal">
              <Button variant="outline" size="sm" className="text-xs">
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Premium sponsors in top row */}
        <div className="mb-4">
          <h3 className="sr-only">Premium Partners</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {premiumSponsors.map((sponsor, index) => (
              <Card 
                key={index} 
                className="border-primary/10 bg-gradient-to-b from-white to-purple-50/20 hover:shadow-sm transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex justify-between items-start">
                      <img 
                        src={sponsor.logo} 
                        alt={`${sponsor.name} logo`} 
                        className="h-8 object-contain"
                      />
                      <div className="bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5 flex items-center">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        Premium
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-medium text-base">{sponsor.name}</h3>
                      <p className="text-gray-600 text-xs mt-1">
                        {sponsor.description}
                      </p>
                    </div>
                    
                    <a 
                      href={sponsor.link} 
                      className="text-primary hover:underline text-xs"
                      rel="noopener"
                    >
                      Learn more
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Standard sponsors in bottom row */}
        <div>
          <h3 className="sr-only">Standard Partners</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {standardSponsors.map((sponsor, index) => (
              <Card 
                key={index} 
                className="border hover:shadow-sm transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex justify-between items-start">
                      <img 
                        src={sponsor.logo} 
                        alt={`${sponsor.name} logo`} 
                        className="h-8 object-contain"
                      />
                      <div className="bg-gray-100 text-gray-600 text-xs rounded-full px-1.5 py-0.5">
                        Partner
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-medium text-base">{sponsor.name}</h3>
                      <p className="text-gray-600 text-xs mt-1">
                        {sponsor.description}
                      </p>
                    </div>
                    
                    <a 
                      href={sponsor.link} 
                      className="text-primary hover:underline text-xs"
                      rel="noopener"
                    >
                      Learn more
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
