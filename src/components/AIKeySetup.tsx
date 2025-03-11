
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { aiService } from "@/services/AIService";
import { toast } from "sonner";

export const AIKeySetup = ({ onKeySet }: { onKeySet?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const key = aiService.getApiKey();
    setHasKey(!!key);
  }, []);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    setIsSaving(true);
    try {
      aiService.setApiKey(apiKey.trim());
      toast.success("AI API key saved successfully");
      setIsOpen(false);
      setHasKey(true);
      if (onKeySet) onKeySet();
    } catch (error) {
      toast.error("Failed to save API key");
      console.error("Error saving API key:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button 
        variant={hasKey ? "outline" : "default"} 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className={hasKey ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" : ""}
      >
        {hasKey ? "AI Key ✓" : "Set AI Key"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Perplexity AI API Key</DialogTitle>
            <DialogDescription>
              Enter your Perplexity API key to enable full AI functionality across MedMed.AI
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="apiKey" className="text-right text-sm font-medium col-span-1">
                API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="col-span-3"
              />
            </div>
            <div className="text-xs text-gray-500 col-span-4 mt-2">
              <p>Get your API key from <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Perplexity API Settings</a></p>
              <p className="mt-1">This key is stored securely in your browser's local storage.</p>
            </div>
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
