
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, RefreshCw, PlusCircle } from "lucide-react";
import { aiService } from "@/services/AIService";
import { AIChat } from "@/components/AIChat";

interface FAQItem {
  question: string;
  answer: string;
}

interface AIFAQProps {
  title?: string;
  category?: string;
  defaultQuestions?: string[];
  showChat?: boolean;
}

export const AIFAQ: React.FC<AIFAQProps> = ({ 
  title = "Frequently Asked Questions", 
  category = "healthcare",
  defaultQuestions = [
    "What medications can interact with blood pressure medication?",
    "How often should I get a general health checkup?",
    "What specialists should I see for chronic headaches?",
    "How can I find affordable medications without insurance?",
    "What's the difference between generic and brand-name medications?"
  ],
  showChat = true
}) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generateMode, setGenerateMode] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [showMoreFaqs, setShowMoreFaqs] = useState(false);

  useEffect(() => {
    generateInitialFAQs();
  }, []);

  const generateInitialFAQs = async () => {
    setLoading(true);
    
    try {
      const initialFaqs: FAQItem[] = [];
      
      // Create a copy of the default questions to ensure we don't modify the original
      const questions = [...defaultQuestions];
      
      // Process 3 questions first for faster initial loading
      for (let i = 0; i < Math.min(3, questions.length); i++) {
        const question = questions[i];
        const response = await aiService.answerFAQ(question);
        
        if (response.success) {
          initialFaqs.push({
            question,
            answer: response.content
          });
        }
      }
      
      setFaqs(initialFaqs);
      
      // Process remaining questions in the background
      if (questions.length > 3) {
        for (let i = 3; i < questions.length; i++) {
          const question = questions[i];
          const response = await aiService.answerFAQ(question);
          
          if (response.success) {
            setFaqs(prev => [
              ...prev,
              {
                question,
                answer: response.content
              }
            ]);
          }
        }
      }
    } catch (error) {
      console.error("Error generating FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshFAQs = () => {
    setFaqs([]);
    generateInitialFAQs();
  };

  const handleCustomQuestion = async (question: string) => {
    if (customQuestions.includes(question)) return;
    
    setCustomQuestions(prev => [...prev, question]);
    
    try {
      const response = await aiService.answerFAQ(question);
      
      if (response.success) {
        setFaqs(prev => [
          {
            question,
            answer: response.content
          },
          ...prev
        ]);
      }
    } catch (error) {
      console.error("Error generating custom FAQ:", error);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            {title}
            <Brain className="ml-2 h-4 w-4 text-primary/70" />
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshFAQs}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && faqs.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="animate-pulse flex space-x-2 mb-4">
                <div className="h-3 w-3 bg-primary/60 rounded-full"></div>
                <div className="h-3 w-3 bg-primary/60 rounded-full"></div>
                <div className="h-3 w-3 bg-primary/60 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-500">Generating AI-powered FAQs...</p>
            </div>
          </div>
        ) : (
          <>
            <Accordion type="single" collapsible className="mb-6">
              {faqs.slice(0, showMoreFaqs ? faqs.length : 5).map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {faqs.length > 5 && !showMoreFaqs && (
              <Button 
                variant="ghost" 
                className="w-full text-primary/80 hover:text-primary hover:bg-primary/5 mb-4"
                onClick={() => setShowMoreFaqs(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Show More FAQs
              </Button>
            )}
            
            {showChat && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-3">
                  Can't find what you're looking for? Ask our AI assistant:
                </p>
                <AIChat 
                  title="Healthcare Assistant"
                  initialSystemPrompt="You are a healthcare FAQ assistant. Answer medical questions accurately and concisely. Always add a disclaimer about consulting healthcare professionals."
                  placeholder="Ask any healthcare question..."
                  maxHeight="300px"
                  onMessageSent={(message) => handleCustomQuestion(message)}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
