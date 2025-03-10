
import { SearchBar } from "@/components/SearchBar";
import { MedicationCard } from "@/components/MedicationCard";
import { SpecialistsList } from "@/components/SpecialistsList";
import { useState } from "react";

const Index = () => {
  const [searchResults, setSearchResults] = useState<Array<{ name: string; details: string; price: string }>>([]);

  const handleSearch = (query: string) => {
    // Mock search results - replace with actual data
    const results = [
      {
        name: "Tretinoin Cream",
        details: "USP 0.033% or 0.09%, Ascorbic Acid USP (Vit C)",
        price: "30g $45 / 60g $75"
      },
      // Add more results based on the query
    ];
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-4">MedMed.AI</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search medications, find specialists, and get personalized healthcare recommendations
          </p>
        </div>

        <div className="mb-12">
          <SearchBar onSearch={handleSearch} />
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-fadeIn">
            {searchResults.map((result, index) => (
              <MedicationCard
                key={index}
                name={result.name}
                details={result.details}
                price={result.price}
              />
            ))}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Specialists</h2>
          <SpecialistsList />
        </div>
      </div>
    </div>
  );
};

export default Index;
