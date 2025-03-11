
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, BarChart } from 'lucide-react';
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
  const sponsors: SponsorProps[] = [
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
      link: "#"
    },
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
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">Our Partners</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We work with trusted healthcare providers to bring you the best services
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Link to="/advertiser-enrollment">
            <Button variant="outline" size="sm">
              Become a Partner
            </Button>
          </Link>
          <Link to="/sponsor-dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              Sponsor Dashboard
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {sponsors.map((sponsor, index) => (
          <Card key={index} className={`border hover:shadow-md transition-all duration-200 ${sponsor.isPremium ? 'border-primary/30' : ''}`}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 h-full">
                <div className="flex justify-between items-start">
                  <img 
                    src={sponsor.logo} 
                    alt={`${sponsor.name} logo`} 
                    className="h-10 object-contain"
                  />
                  <div className={`text-xs ${sponsor.isPremium ? 'bg-primary/10 text-primary' : 'bg-gray-100'} rounded-full px-2 py-1`}>
                    {sponsor.isPremium ? 'Premium Sponsor' : 'Sponsored'}
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-medium text-lg">{sponsor.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    {sponsor.description}
                  </p>
                </div>
                
                <a 
                  href={sponsor.link} 
                  className="text-primary hover:underline text-sm flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
