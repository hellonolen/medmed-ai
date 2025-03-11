
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, MapPin, X } from "lucide-react";
import { useDebounce } from '@/hooks/useDebounce';
import { searchService, SearchParams } from '@/services/SearchService';
import { toast } from '@/hooks/use-toast';

interface PharmacySearchFormProps {
  onSearch: (results: any[]) => void;
  onSearchStart: () => void;
  initialSearch?: string;
}

export const PharmacySearchForm: React.FC<PharmacySearchFormProps> = ({
  onSearch,
  onSearchStart,
  initialSearch = ""
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState(initialSearch || "");
  const [location, setLocation] = useState("");
  const [searchType, setSearchType] = useState<"pharmacy" | "medspa">("pharmacy");
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedSearch = useDebounce(async (params: SearchParams) => {
    try {
      const results = await searchService.searchAll(params);
      
      // Filter results based on search type
      const filteredResults = results.filter(result => {
        if (searchType === "pharmacy") {
          return result.type === "Pharmacy";
        } else {
          return result.type === "Med Spa";
        }
      });
      
      onSearch(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to search pharmacies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name && !location) {
      toast({
        title: "Search Error",
        description: "Please enter a name or location to search",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    onSearchStart();
    
    const searchParams: SearchParams = {
      query: name,
      category: 'pharmacies',
      ...(location && { location })
    };
    
    await debouncedSearch(searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs 
        defaultValue="pharmacy" 
        value={searchType} 
        onValueChange={(v) => setSearchType(v as "pharmacy" | "medspa")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pharmacy">{t("pharmacy.type", "Pharmacy")}</TabsTrigger>
          <TabsTrigger value="medspa">{t("medspa.type", "Med Spa")}</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="name">{t("pharmacy.name", "Name")}</Label>
          <div className="relative">
            <Input
              id="name"
              placeholder={searchType === "pharmacy" 
                ? t("pharmacy.name_placeholder", "Enter pharmacy name") 
                : t("medspa.name_placeholder", "Enter med spa name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pr-10"
            />
            {name && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setName("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">{t("pharmacy.location", "Location")}</Label>
          <div className="relative">
            <Input
              id="location"
              placeholder={t("pharmacy.location_placeholder", "City, state, or zip code")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isSearching || (!name && !location)}
        >
          {isSearching ? (
            t("pharmacy.searching", "Searching...")
          ) : (
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>{t("pharmacy.search", "Search")}</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};
