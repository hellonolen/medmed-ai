
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { aiService } from "@/services/AIService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertCircle, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Provider = 'perplexity' | 'openai' | 'claude' | 'specialized';

interface ProviderConfig {
  name: string;
  description: string;
  keyPlaceholder: string;
  docLink: string;
  recommended: boolean;
}

export const AIKeySetup = ({ onKeySet }: { onKeySet?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Provider>('perplexity');
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>({
    perplexity: "",
    openai: "",
    claude: "",
    specialized: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [configuredProviders, setConfiguredProviders] = useState<Provider[]>([]);
  const [keyValidation, setKeyValidation] = useState<Record<Provider, boolean | null>>({
    perplexity: null,
    openai: null,
    claude: null,
    specialized: null
  });

  // Provider configuration data
  const providers: Record<Provider, ProviderConfig> = {
    perplexity: {
      name: "Data Source 1",
      description: "General purpose search with good knowledge base",
      keyPlaceholder: "pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      docLink: "https://www.perplexity.ai/settings/api",
      recommended: true
    },
    openai: {
      name: "Data Source 2",
      description: "Highly accurate with broad knowledge",
      keyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      docLink: "https://platform.openai.com/api-keys",
      recommended: true
    },
    claude: {
      name: "Data Source 3",
      description: "Known for thoughtful, nuanced responses",
      keyPlaceholder: "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      docLink: "https://console.anthropic.com/keys",
      recommended: false
    },
    specialized: {
      name: "MedData",
      description: "Domain-specific for medical applications",
      keyPlaceholder: "healthcare-xxxxxxxxxxxxxxxxxxxxxxxx",
      docLink: "#",
      recommended: false
    }
  };

  // Load saved keys on component mount
  useEffect(() => {
    const loadKeys = () => {
      const configured: Provider[] = [];
      
      // Check for each provider
      Object.keys(providers).forEach((provider) => {
        const key = aiService.getApiKey(provider as Provider);
        if (key) {
          configured.push(provider as Provider);
          setApiKeys(prev => ({
            ...prev,
            [provider]: key
          }));
        }
      });
      
      setConfiguredProviders(configured);
    };
    
    loadKeys();
  }, []);

  const validateApiKey = async (provider: Provider, key: string): Promise<boolean> => {
    setIsValidating(true);
    try {
      // In a real app, we would make a lightweight API call to validate the key
      // For demo purposes, we'll just check if the key matches the expected format
      let isValid = false;
      
      switch (provider) {
        case 'perplexity':
          isValid = key.startsWith('pplx-');
          break;
        case 'openai':
          isValid = key.startsWith('sk-');
          break;
        case 'claude':
          isValid = key.startsWith('sk-ant-');
          break;
        case 'specialized':
          isValid = key.startsWith('healthcare-');
          break;
      }
      
      // Simulate an API validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would make a test API call here
      return isValid;
    } catch (error) {
      console.error(`Error validating ${provider} key:`, error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKeys[activeTab]?.trim()) {
      toast.error(`Please enter a valid ${providers[activeTab].name} key`);
      return;
    }

    setIsSaving(true);
    try {
      // Validate the key format
      const isValid = await validateApiKey(activeTab, apiKeys[activeTab]);
      setKeyValidation(prev => ({
        ...prev,
        [activeTab]: isValid
      }));
      
      if (!isValid) {
        toast.error(`Invalid ${providers[activeTab].name} key format`);
        setIsSaving(false);
        return;
      }
      
      // Save the key if valid
      aiService.setApiKey(activeTab, apiKeys[activeTab].trim());
      toast.success(`${providers[activeTab].name} key saved successfully`);
      
      // Update configured providers list
      if (!configuredProviders.includes(activeTab)) {
        setConfiguredProviders(prev => [...prev, activeTab]);
      }
      
      if (onKeySet) onKeySet();
    } catch (error) {
      toast.error(`Failed to save ${providers[activeTab].name} key`);
      console.error(`Error saving ${providers[activeTab].name} key:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonColor = () => {
    if (configuredProviders.length === 0) {
      return ""; // Default button styling
    } else if (configuredProviders.length === 1) {
      return "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800";
    } else {
      return "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800";
    }
  };

  return (
    <>
      <Button 
        variant={configuredProviders.length > 0 ? "outline" : "default"} 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className={getButtonColor()}
      >
        {configuredProviders.length === 0 ? (
          "Configure Data Sources"
        ) : configuredProviders.length === 1 ? (
          <span className="flex items-center"><Check className="mr-1 h-3 w-3" /> 1 Source</span>
        ) : (
          <span className="flex items-center"><Check className="mr-1 h-3 w-3" /> {configuredProviders.length} Sources</span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Configure Data Sources</DialogTitle>
            <DialogDescription>
              Add keys for multiple data sources to improve accuracy and safety of medical information
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as Provider)}>
            <TabsList className="grid grid-cols-4">
              {Object.entries(providers).map(([key, provider]) => (
                <TabsTrigger key={key} value={key} className="relative">
                  {provider.name.split(' ')[0]}
                  {configuredProviders.includes(key as Provider) && (
                    <span className="absolute -top-1 -right-1">
                      <Check className="h-3 w-3 text-green-500" />
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(providers).map(([key, provider]) => (
              <TabsContent key={key} value={key} className="py-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{provider.name}</h3>
                      <p className="text-sm text-gray-500">{provider.description}</p>
                    </div>
                    {provider.recommended && (
                      <div className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                        Recommended
                      </div>
                    )}
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor={`${key}-apiKey`} className="text-right text-sm font-medium col-span-1">
                        Key
                      </label>
                      <div className="col-span-3 relative">
                        <Input
                          id={`${key}-apiKey`}
                          type="password"
                          value={apiKeys[key as Provider]}
                          onChange={(e) => {
                            setApiKeys(prev => ({
                              ...prev,
                              [key]: e.target.value
                            }));
                            // Reset validation state when key changes
                            setKeyValidation(prev => ({
                              ...prev,
                              [key]: null
                            }));
                          }}
                          placeholder={provider.keyPlaceholder}
                          className={keyValidation[key as Provider] === false ? "border-red-500" : ""}
                        />
                        {keyValidation[key as Provider] !== null && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {keyValidation[key as Provider] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {keyValidation[key as Provider] === false && (
                      <Alert variant="destructive" className="col-span-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Invalid API key format. Please check your key and try again.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="col-span-4 flex items-start space-x-2 text-xs text-gray-500 mt-2">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p>Get your key from <a href={provider.docLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{provider.name} Settings</a></p>
                        <p className="mt-1">This key is stored securely in your browser's local storage.</p>
                        
                        {key === 'perplexity' && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-amber-800">
                            <p className="font-medium">Why {provider.name}?</p>
                            <p>Provides search capabilities which can deliver up-to-date medical information.</p>
                          </div>
                        )}
                        
                        {key === 'openai' && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-amber-800">
                            <p className="font-medium">Why {provider.name}?</p>
                            <p>Offers highly accurate healthcare information with advanced safety filters.</p>
                          </div>
                        )}
                        
                        {key === 'claude' && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-amber-800">
                            <p className="font-medium">Why {provider.name}?</p>
                            <p>Known for more nuanced, thoughtful responses, especially on sensitive topics.</p>
                          </div>
                        )}
                        
                        {key === 'specialized' && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-amber-800">
                            <p className="font-medium">Specialized Healthcare Data</p>
                            <p>This is a healthcare data service that provides domain-specific expertise.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="bg-blue-50 p-3 rounded-md mt-4 text-sm text-blue-800">
            <h4 className="font-semibold flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Multiple Source Benefits
            </h4>
            <p className="mt-1">Configuring multiple data sources significantly improves the safety and accuracy of medical information by:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Cross-checking answers between sources</li>
              <li>Blocking unsafe advice through consensus verification</li>
              <li>Providing more comprehensive medical knowledge</li>
              <li>Ensuring backup sources if one service is unavailable</li>
            </ul>
            <p className="mt-1">We recommend configuring at least Data Source 1 and Data Source 2 for optimal results.</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveKey} 
              disabled={isSaving || isValidating}
              className="relative"
            >
              {isSaving || isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isValidating ? "Validating..." : "Saving..."}
                </>
              ) : (
                "Save Key"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
