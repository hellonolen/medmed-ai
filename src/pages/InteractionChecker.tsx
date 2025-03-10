
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Plus, Trash2, AlertCircle, Check, X } from "lucide-react";
import { toast } from "sonner";

type Severity = "high" | "moderate" | "low" | "none";

interface Interaction {
  id: string;
  medications: [string, string];
  severity: Severity;
  description: string;
  recommendation: string;
}

// Mock interactions data (in a real app this would come from an API)
const mockInteractions: Record<string, Interaction[]> = {
  "ibuprofen-acetaminophen": [
    {
      id: "1",
      medications: ["Ibuprofen", "Acetaminophen"],
      severity: "low",
      description: "These medications are often used together with minimal risk when taken as directed.",
      recommendation: "Safe to use together at recommended doses, but consult your doctor for long-term use."
    }
  ],
  "ibuprofen-aspirin": [
    {
      id: "2",
      medications: ["Ibuprofen", "Aspirin"],
      severity: "moderate",
      description: "Combining these medications may increase the risk of gastrointestinal bleeding.",
      recommendation: "Avoid taking together regularly without medical supervision."
    }
  ],
  "warfarin-aspirin": [
    {
      id: "3",
      medications: ["Warfarin", "Aspirin"],
      severity: "high",
      description: "This combination significantly increases the risk of bleeding.",
      recommendation: "Do not take together unless specifically directed by your healthcare provider."
    }
  ],
  "omeprazole-clopidogrel": [
    {
      id: "4",
      medications: ["Omeprazole", "Clopidogrel"],
      severity: "moderate",
      description: "Omeprazole may reduce the effectiveness of clopidogrel.",
      recommendation: "Consider alternative acid-reducing medications such as famotidine."
    }
  ]
};

// List of common medications for autocomplete
const commonMedications = [
  "Acetaminophen", "Adderall", "Albuterol", "Amlodipine", "Amoxicillin",
  "Aspirin", "Atorvastatin", "Azithromycin", "Bupropion", "Citalopram",
  "Clopidogrel", "Cyclobenzaprine", "Doxycycline", "Duloxetine", "Escitalopram",
  "Fluoxetine", "Furosemide", "Gabapentin", "Hydrochlorothiazide", "Hydroxyzine",
  "Ibuprofen", "Levothyroxine", "Lisinopril", "Loratadine", "Lorazepam",
  "Losartan", "Metformin", "Metoprolol", "Montelukast", "Naproxen",
  "Omeprazole", "Pantoprazole", "Prednisone", "Sertraline", "Simvastatin",
  "Tamsulosin", "Trazodone", "Warfarin", "Xanax", "Zoloft"
];

const InteractionChecker = () => {
  const [medications, setMedications] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  
  const filteredSuggestions = commonMedications.filter(med => 
    med.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !medications.includes(med)
  );
  
  const addMedication = (medication: string) => {
    if (medications.includes(medication)) {
      toast.error("This medication is already in your list");
      return;
    }
    
    if (medications.length >= 10) {
      toast.error("You can check up to 10 medications at once");
      return;
    }
    
    setMedications([...medications, medication]);
    setSearchTerm("");
    setShowSuggestions(false);
  };
  
  const removeMedication = (medication: string) => {
    setMedications(medications.filter(med => med !== medication));
    // Clear interactions if they exist
    if (hasChecked) {
      setInteractions([]);
      setHasChecked(false);
    }
  };
  
  const checkInteractions = () => {
    if (medications.length < 2) {
      toast.error("Please add at least 2 medications to check for interactions");
      return;
    }
    
    // Find all potential interaction pairs
    const foundInteractions: Interaction[] = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].toLowerCase();
        const med2 = medications[j].toLowerCase();
        
        // Check both possible combinations
        const key1 = `${med1}-${med2}`;
        const key2 = `${med2}-${med1}`;
        
        if (mockInteractions[key1]) {
          foundInteractions.push(...mockInteractions[key1]);
        } else if (mockInteractions[key2]) {
          foundInteractions.push(...mockInteractions[key2]);
        } else {
          // No known interaction found, create a "none" interaction
          foundInteractions.push({
            id: `${med1}-${med2}`,
            medications: [medications[i], medications[j]],
            severity: "none",
            description: "No known interaction between these medications.",
            recommendation: "Safe to use together based on available information."
          });
        }
      }
    }
    
    setInteractions(foundInteractions);
    setHasChecked(true);
    
    if (foundInteractions.some(i => i.severity === "high")) {
      toast.error("Potential severe interaction detected. Please consult your doctor.");
    } else if (foundInteractions.some(i => i.severity === "moderate")) {
      toast.warning("Potential moderate interaction detected. Use caution.");
    } else {
      toast.success("No severe interactions found.");
    }
  };
  
  const clearAll = () => {
    setMedications([]);
    setInteractions([]);
    setHasChecked(false);
  };
  
  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case "high":
        return (
          <div className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">
            <AlertCircle className="h-3 w-3" /> Severe
          </div>
        );
      case "moderate":
        return (
          <div className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded">
            <AlertCircle className="h-3 w-3" /> Moderate
          </div>
        );
      case "low":
        return (
          <div className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
            <AlertCircle className="h-3 w-3" /> Minor
          </div>
        );
      case "none":
        return (
          <div className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
            <Check className="h-3 w-3" /> No interaction
          </div>
        );
    }
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
          <h1 className="text-4xl font-bold text-primary mb-4">Medication Interaction Checker</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check for potential interactions between your medications
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold">Your Medications</CardTitle>
                {medications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" /> Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search for a medication..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                          onClick={() => addMedication(suggestion)}
                        >
                          <span>{suggestion}</span>
                          <Plus className="h-4 w-4 text-primary" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {medications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Add medications to check for interactions</p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {medications.map((med, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{med}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeMedication(med)}
                        className="h-6 w-6 text-gray-500 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                onClick={checkInteractions} 
                className="w-full"
                disabled={medications.length < 2}
              >
                Check Interactions
              </Button>
            </CardContent>
          </Card>
          
          {hasChecked && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Interaction Results</h2>
              
              {interactions.length === 0 ? (
                <div className="text-center py-8 bg-green-50 rounded-lg">
                  <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-800">No interactions found between these medications.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interactions.map((interaction, index) => (
                    <Card key={index} className="backdrop-blur-md bg-card/90 border-0 shadow-lg overflow-hidden">
                      <div className={`p-4 border-l-4 ${
                        interaction.severity === "high" ? "border-red-500 bg-red-50" :
                        interaction.severity === "moderate" ? "border-amber-500 bg-amber-50" :
                        interaction.severity === "low" ? "border-blue-500 bg-blue-50" :
                        "border-green-500 bg-green-50"
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">
                            {interaction.medications[0]} + {interaction.medications[1]}
                          </h3>
                          {getSeverityBadge(interaction.severity)}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{interaction.description}</p>
                        <p className="text-sm font-medium">
                          Recommendation: {interaction.recommendation}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 font-medium">Important Disclaimer</p>
                  <p className="text-yellow-700 text-sm">
                    This information is for educational purposes only and should not replace professional medical advice. 
                    Always consult with your healthcare provider before making any changes to your medication regimen.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractionChecker;
