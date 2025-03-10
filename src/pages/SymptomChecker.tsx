
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Search, AlertCircle } from "lucide-react";
import { findMatchingSymptoms, medicalConditions } from "@/data/symptoms";
import { toast } from "sonner";

const commonSymptoms = [
  "Headache", "Fever", "Cough", "Fatigue", "Nausea", 
  "Dizziness", "Sore Throat", "Rash", "Back Pain", "Abdominal Pain",
  "Chest Pain", "Shortness of Breath", "Joint Pain", "Muscle Pain",
  "Diarrhea", "Constipation", "Blurred Vision", "Itching", "Swelling"
];

interface PossibleCondition {
  name: string;
  probability: number; // 0-100
  description: string;
  symptoms: string[];
  specialists: string[];
}

const SymptomChecker = () => {
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [results, setResults] = useState<PossibleCondition[]>([]);
  
  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(symptoms => symptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms(symptoms => [...symptoms, symptom]);
    }
  };
  
  const addCustomSymptom = () => {
    if (!customSymptom.trim()) return;
    
    if (selectedSymptoms.includes(customSymptom)) {
      toast.error("This symptom is already added");
      return;
    }
    
    setSelectedSymptoms(symptoms => [...symptoms, customSymptom]);
    setCustomSymptom("");
  };
  
  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }
    
    // Find matching conditions based on selected symptoms
    const conditionMatches: Record<string, { count: number, category: string, symptoms: string[], specialists: string[] }> = {};
    
    selectedSymptoms.forEach(symptom => {
      const matchedSymptoms = findMatchingSymptoms(symptom);
      
      matchedSymptoms.forEach(match => {
        match.relatedConditions.forEach(condition => {
          const matchedCondition = medicalConditions.find(c => c.category === condition);
          
          if (matchedCondition) {
            if (!conditionMatches[condition]) {
              conditionMatches[condition] = { 
                count: 0, 
                category: condition,
                symptoms: matchedCondition.symptoms,
                specialists: matchedCondition.specialists
              };
            }
            conditionMatches[condition].count += 1;
          }
        });
      });
    });
    
    // Convert to array and sort by match count
    const possibleConditions: PossibleCondition[] = Object.values(conditionMatches)
      .map(match => {
        // Calculate a simple probability based on symptom match ratio
        const matchedSymptomsCount = match.count;
        const totalCategorySymptoms = match.symptoms.length;
        const selectedCount = selectedSymptoms.length;
        
        const probability = Math.min(
          Math.round((matchedSymptomsCount / Math.max(selectedCount, 2)) * 100),
          95 // Cap at 95% to avoid absolute certainty
        );
        
        return {
          name: match.category,
          probability,
          description: `This condition typically involves ${match.symptoms.slice(0, 3).join(", ")}${match.symptoms.length > 3 ? ", and more" : ""}`,
          symptoms: match.symptoms,
          specialists: match.specialists
        };
      })
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5); // Top 5 matches
    
    setResults(possibleConditions);
    setStep(2);
  };
  
  const restartChecker = () => {
    setSelectedSymptoms([]);
    setResults([]);
    setStep(1);
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
          <h1 className="text-4xl font-bold text-primary mb-4">Symptom Checker</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {step === 1 ? 
              "Select the symptoms you're experiencing to get possible conditions" :
              "Based on your symptoms, here are some possible conditions"
            }
          </p>
        </div>
        
        {step === 1 ? (
          <div className="max-w-3xl mx-auto">
            <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Selected Symptoms ({selectedSymptoms.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSymptoms.length === 0 ? (
                  <p className="text-gray-500 italic">No symptoms selected yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom, index) => (
                      <div key={index} className="bg-secondary rounded-full px-3 py-1 flex items-center gap-1 text-sm">
                        {symptom}
                        <button
                          onClick={() => handleSymptomToggle(symptom)}
                          className="ml-1 hover:text-destructive"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Add another symptom..."
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-200 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && addCustomSymptom()}
                    />
                  </div>
                  <Button onClick={addCustomSymptom} size="sm">Add</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Common Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {commonSymptoms.map((symptom, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-2"
                    >
                      <Checkbox 
                        id={`symptom-${index}`} 
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={() => handleSymptomToggle(symptom)}
                      />
                      <label
                        htmlFor={`symptom-${index}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {symptom}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <Button 
                onClick={analyzeSymptoms}
                disabled={selectedSymptoms.length === 0}
                className="px-6"
              >
                Analyze Symptoms <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium">Important Disclaimer</p>
                <p className="text-yellow-700 text-sm">
                  This symptom checker provides general information only and should not be used for diagnosis or treatment. 
                  Always consult with a qualified healthcare provider for medical advice.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Your Symptoms:</h2>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom, index) => (
                  <div key={index} className="bg-secondary rounded-full px-3 py-1 text-sm">
                    {symptom}
                  </div>
                ))}
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Possible Conditions:</h2>
            <div className="space-y-4 mb-8">
              {results.length === 0 ? (
                <Card className="border-dashed border-gray-300 p-6 text-center">
                  <p className="text-gray-500">No matching conditions found for your symptoms.</p>
                </Card>
              ) : (
                results.map((condition, index) => (
                  <Card key={index} className="backdrop-blur-md bg-card/90 border-0 shadow-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">{condition.name}</h3>
                        <div className="text-sm font-medium">
                          {condition.probability >= 70 ? (
                            <span className="text-red-600">High match</span>
                          ) : condition.probability >= 40 ? (
                            <span className="text-yellow-600">Moderate match</span>
                          ) : (
                            <span className="text-blue-600">Low match</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700 mb-4">{condition.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Common Symptoms:</h4>
                        <div className="flex flex-wrap gap-2">
                          {condition.symptoms.slice(0, 6).map((symptom, i) => (
                            <div 
                              key={i} 
                              className={`text-xs px-2 py-1 rounded ${
                                selectedSymptoms.includes(symptom) 
                                  ? "bg-primary/10 text-primary" 
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {symptom}
                            </div>
                          ))}
                          {condition.symptoms.length > 6 && (
                            <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                              +{condition.symptoms.length - 6} more
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommended Specialists:</h4>
                        <div className="flex flex-wrap gap-2">
                          {condition.specialists.map((specialist, i) => (
                            <div key={i} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">
                              {specialist}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
            
            <div className="text-center">
              <Button onClick={restartChecker} variant="outline" className="mr-3">
                Start Over
              </Button>
              <Link to="/">
                <Button>
                  Search Medications
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;
