
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { aiService } from "@/services/AIService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertCircle, Info } from "lucide-react";

type AIProvider = 'perplexity' | 'openai' | 'claude' | 'specialized';

interface ProviderConfig {
  name: string;
  description: string;
  keyPlaceholder: string;
  docLink: string;
  recommended: boolean;
}

export const AIKeySetup = ({ onKeySet }: { onKeySet?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AIProvider>('perplexity');
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({
    perplexity: "",
    openai: "",
    claude: "",
    specialized: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [configuredProviders, setConfiguredProviders] = useState<AIProvider[]>([]);

  // Provider configuration data
  const providers: Record<AIProvider, ProviderConfig> = {
    perplexity: {
      name: "Perplexity AI",
      description: "General purpose AI with good medical knowledge",
      keyPlaceholder: "pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      docLink: "https://www.perplexity.ai/settings/api",
      recommended: true
    },
    openai: {
      name: "OpenAI GPT-4o",
      description: "Highly accurate with broad medical knowledge",
      keyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      docLink: "https://platform.openai.com/api-keys",
      recommended: true
    },
    claude: {
      name: "Anthropic Claude",
      description: "Known for thoughtful, nuanced responses",
      keyPlaceholder: "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      docLink: "https://console.anthropic.com/keys",
      recommended: false
    },
    specialized: {
      name: "Specialized Healthcare AI",
      description: "Domain-specific for medical applications",
      keyPlaceholder: "healthcare-xxxxxxxxxxxxxxxxxxxxxxxx",
      docLink: "#",
      recommended: false
    }
  };

  // Load saved API keys on component mount
  useEffect(() => {
    const loadKeys = () => {
      const configured: AIProvider[] = [];
      
      // Check for each provider
      Object.keys(providers).forEach((provider) => {
        const key = aiService.getApiKey(provider as AIProvider);
        if (key) {
          configured.push(provider as AIProvider);
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

  const handleSaveKey = async () => {
    if (!apiKeys[activeTab]?.trim()) {
      toast.error(`Please enter a valid ${providers[activeTab].name} API key`);
      return;
    }

    setIsSaving(true);
    try {
      aiService.setApiKey(activeTab, apiKeys[activeTab].trim());
      toast.success(`${providers[activeTab].name} API key saved successfully`);
      
      // Update configured providers list
      if (!configuredProviders.includes(activeTab)) {
        setConfiguredProviders(prev => [...prev, activeTab]);
      }
      
      if (onKeySet) onKeySet();
    } catch (error) {
      toast.error(`Failed to save ${providers[activeTab].name} API key`);
      console.error(`Error saving ${providers[activeTab].name} API key:`, error);
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
          "Set AI Keys"
        ) : configuredProviders.length === 1 ? (
          <span className="flex items-center"><Check className="mr-1 h-3 w-3" /> 1 AI Provider</span>
        ) : (
          <span className="flex items-center"><Check className="mr-1 h-3 w-3" /> {configuredProviders.length} AI Providers</span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Configure AI Providers</DialogTitle>
            <DialogDescription>
              Add API keys for multiple AI providers to improve accuracy and safety of medical information
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as AIProvider)}>
            <TabsList className="grid grid-cols-4">
              {Object.entries(providers).map(([key, provider]) => (
                <TabsTrigger key={key} value={key} className="relative">
                  {provider.name.split(' ')[0]}
                  {configuredProviders.includes(key as AIProvider) && (
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
                        API Key
                      </label>
                      <Input
                        id={`${key}-apiKey`}
                        type="password"
                        value={apiKeys[key as AIProvider]}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          [key]: e.target.value
                        }))}
                        placeholder={provider.keyPlaceholder}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="col-span-4 flex items-start space-x-2 text-xs text-gray-500 mt-2">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p>Get your API key from <a href={provider.docLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{provider.name} API Settings</a></p>
                        <p className="mt-1">This key is stored securely in your browser's local storage.</p>
                        
                        {key === 'perplexity' && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-amber-800">
                            <p className="font-medium">Why Perplexity?</p>
                            <p>Perplexity provides search capabilities which can deliver up-to-date medical information.</p>
                          </div>
                        )}
                        
                        {key === 'openai' && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-amber-800">
                            <p className="font-medium">Why OpenAI?</p>
                            <p>GPT-4o offers highly accurate healthcare information with advanced safety filters.</p>
                          </div>
                        )}
                        
                        {key === 'claude' && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-amber-800">
                            <p className="font-medium">Why Claude?</p>
                            <p>Claude is known for more nuanced, thoughtful responses, especially on sensitive topics.</p>
                          </div>
                        )}
                        
                        {key === 'specialized' && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-amber-800">
                            <p className="font-medium">Specialized Healthcare AI</p>
                            <p>This is a placeholder for a dedicated healthcare AI service that would provide domain-specific expertise.</p>
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
              Multiple Provider Benefits
            </h4>
            <p className="mt-1">Configuring multiple AI providers significantly improves the safety and accuracy of medical information by:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Cross-checking answers between providers</li>
              <li>Blocking unsafe advice through consensus verification</li>
              <li>Providing more comprehensive medical knowledge</li>
              <li>Ensuring backup providers if one service is unavailable</li>
            </ul>
            <p className="mt-1">We recommend configuring at least Perplexity and OpenAI for optimal results.</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveKey} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
