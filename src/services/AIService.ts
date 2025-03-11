
import { toast } from "sonner";

interface AIRequest {
  query: string;
  context?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

export class AIService {
  private static instance: AIService;
  private apiKey: string | null = null;

  private constructor() {
    // Try to get API key from storage or environment
    this.apiKey = localStorage.getItem('PERPLEXITY_API_KEY') || process.env.PERPLEXITY_API_KEY || null;
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('PERPLEXITY_API_KEY', key);
  }

  public getApiKey(): string | null {
    return this.apiKey;
  }

  public async askAI({ query, context = "", systemPrompt = "", temperature = 0.2, maxTokens = 1000 }: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      console.warn("No API key available for AI Service");
      toast.warning("AI features limited. Please add Perplexity API key for full experience.");
      return {
        content: "I apologize, but I don't have access to the AI service right now. Please add an API key in your settings.",
        success: false,
        error: "API key not available"
      };
    }

    try {
      console.log("Querying AI:", { query, context, systemPrompt });
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: systemPrompt || 'You are a helpful AI assistant for the MedMed.AI healthcare platform. Provide accurate, concise, and helpful information.'
            },
            ...(context ? [{
              role: 'user',
              content: `Context: ${context}`
            }] : []),
            {
              role: 'user',
              content: query
            }
          ],
          temperature,
          max_tokens: maxTokens,
          return_search: true
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        success: true
      };
    } catch (error) {
      console.error("Error in AI Service:", error);
      return {
        content: "I apologize, but I encountered an error while processing your request.",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Specialized methods for different parts of the application
  
  public async getPaymentVerification(paymentDetails: any): Promise<AIResponse> {
    return this.askAI({
      query: JSON.stringify(paymentDetails),
      systemPrompt: 'Analyze the payment details and verify if this payment should be processed. Return ONLY a JSON with format {"verified": boolean, "risk": "low"|"medium"|"high", "reason": "string"}. No other text.'
    });
  }

  public async getOnboardingHelp(step: string, userInfo?: any): Promise<AIResponse> {
    return this.askAI({
      query: `User is on onboarding step: ${step}. ${userInfo ? `User info: ${JSON.stringify(userInfo)}` : ''}`,
      systemPrompt: 'You are an onboarding assistant. Provide helpful guidance for users at this stage of onboarding. Be concise and actionable.'
    });
  }

  public async answerFAQ(question: string): Promise<AIResponse> {
    return this.askAI({
      query: question,
      systemPrompt: 'You are a healthcare FAQ assistant. Answer the question accurately and concisely with medical information. Always add a disclaimer that this is not medical advice.',
      temperature: 0.1
    });
  }

  public async getSolutionForProblem(problem: string): Promise<AIResponse> {
    return this.askAI({
      query: problem,
      systemPrompt: 'You are a healthcare problem-solving assistant. Analyze this problem and provide possible solutions or next steps. Be comprehensive but concise.',
      maxTokens: 1500
    });
  }

  public async getSpecialistRecommendation(symptoms: string[], conditions?: string[]): Promise<AIResponse> {
    return this.askAI({
      query: `Symptoms: ${symptoms.join(", ")}. ${conditions ? `Existing conditions: ${conditions.join(", ")}` : ''}`,
      systemPrompt: 'You are a specialist recommendation assistant. Based on these symptoms and conditions, recommend appropriate medical specialists who should be consulted. Return a JSON array with format [{"specialistType": "string", "reasonToConsult": "string"}]. Add a disclaimer about seeking proper medical advice.',
      temperature: 0.1
    });
  }

  public async getMedicationInteractionCheck(medications: string[]): Promise<AIResponse> {
    return this.askAI({
      query: `Check interactions between: ${medications.join(", ")}`,
      systemPrompt: 'You are a medication interaction checker. Analyze these medications for potential interactions. Return a JSON with format {"interactions": [{"severity": "low"|"medium"|"high", "description": "string", "medications": ["med1", "med2"]}], "disclaimer": "string"}. Be thorough but concise.',
      temperature: 0.1
    });
  }

  public async analyzeHealthData(data: any): Promise<AIResponse> {
    return this.askAI({
      query: JSON.stringify(data),
      systemPrompt: 'You are a health data analyst. Analyze this health data and provide insights. Return a JSON with format {"insights": ["string"], "recommendations": ["string"], "disclaimer": "string"}. Be thorough but concise.',
      temperature: 0.1
    });
  }
}

export const aiService = AIService.getInstance();
