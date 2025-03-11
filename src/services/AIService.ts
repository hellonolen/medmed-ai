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
  source?: string;
}

type AIProvider = 'perplexity' | 'openai' | 'claude' | 'specialized';

// List of dangerous medical topics requiring extra scrutiny
const DANGEROUS_MEDICAL_TOPICS = [
  "inject", "injection", "surgery", "self-medication", "self-administer",
  "diy", "at home", "without doctor", "self-surgery", "dosage increase",
  "overdose", "substitute medication", "alternative treatment", "homemade remedy"
];

export class AIService {
  private static instance: AIService;
  private apiKeys: Record<AIProvider, string | null> = {
    perplexity: null,
    openai: null,
    claude: null,
    specialized: null
  };
  private activeProviders: AIProvider[] = ['perplexity'];

  private constructor() {
    // Try to get API keys from storage
    this.apiKeys.perplexity = localStorage.getItem('PERPLEXITY_API_KEY') || process.env.PERPLEXITY_API_KEY || null;
    this.apiKeys.openai = localStorage.getItem('OPENAI_API_KEY') || null;
    this.apiKeys.claude = localStorage.getItem('CLAUDE_API_KEY') || null;
    this.apiKeys.specialized = localStorage.getItem('SPECIALIZED_API_KEY') || null;
    
    // Determine which providers are active based on available keys
    this.updateActiveProviders();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private updateActiveProviders(): void {
    this.activeProviders = Object.entries(this.apiKeys)
      .filter(([_, value]) => value !== null)
      .map(([key]) => key as AIProvider);
    
    // Always keep perplexity as fallback even if no key
    if (!this.activeProviders.includes('perplexity')) {
      this.activeProviders.push('perplexity');
    }
    
    console.log("Active AI providers:", this.activeProviders);
  }

  public setApiKey(provider: AIProvider, key: string): void {
    this.apiKeys[provider] = key;
    localStorage.setItem(`${provider.toUpperCase()}_API_KEY`, key);
    this.updateActiveProviders();
  }

  public getApiKey(provider: AIProvider): string | null {
    return this.apiKeys[provider];
  }

  public getAvailableProviders(): AIProvider[] {
    return this.activeProviders;
  }

  // Check if the query contains potentially dangerous medical content
  private containsDangerousMedicalContent(query: string): boolean {
    const lowercaseQuery = query.toLowerCase();
    return DANGEROUS_MEDICAL_TOPICS.some(topic => 
      lowercaseQuery.includes(topic)
    );
  }

  // Add additional safety system prompt based on query analysis
  private addSafetyPrompt(systemPrompt: string, query: string): string {
    // If query contains dangerous topics, add strong safety warnings
    if (this.containsDangerousMedicalContent(query)) {
      return `${systemPrompt}\n\nIMPORTANT SAFETY NOTICE: This query appears to involve potentially dangerous medical procedures or self-medication. Do NOT provide instructions for medical procedures that should only be performed by healthcare professionals. Do NOT provide dosage information for prescription medications. You MUST include clear warnings about seeking professional medical help. You MUST emphasize that proper medical supervision is required. NEVER suggest DIY or at-home alternatives to professional medical care for serious conditions.`;
    }
    
    // Default safety addition for all medical queries
    return `${systemPrompt}\n\nRemember to prioritize patient safety. Never provide medical advice that could be harmful. Always recommend consulting with healthcare professionals for personalized medical advice.`;
  }

  // Query a single AI provider
  private async queryProvider(
    provider: AIProvider, 
    query: string, 
    systemPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    try {
      switch (provider) {
        case 'perplexity':
          return await this.queryPerplexity(query, systemPrompt, temperature, maxTokens);
        case 'openai':
          return await this.queryOpenAI(query, systemPrompt, temperature, maxTokens);
        case 'claude':
          return await this.queryClaude(query, systemPrompt, temperature, maxTokens);
        case 'specialized':
          return await this.querySpecializedHealthcare(query, systemPrompt, temperature, maxTokens);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error querying ${provider}:`, error);
      return {
        content: `The ${provider} AI service encountered an error.`,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: provider
      };
    }
  }

  // Perplexity API implementation
  private async queryPerplexity(
    query: string, 
    systemPrompt: string, 
    temperature: number, 
    maxTokens: number
  ): Promise<AIResponse> {
    const apiKey = this.apiKeys.perplexity;
    
    if (!apiKey) {
      // Fallback to mock response if no API key
      console.warn("No Perplexity API key available");
      return {
        content: "I apologize, but I don't have access to the Perplexity AI service right now. Please add an API key in your settings or try a different provider.",
        success: false,
        error: "API key not available",
        source: 'perplexity'
      };
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: this.addSafetyPrompt(systemPrompt, query)
            },
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
        throw new Error(`Perplexity API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        success: true,
        source: 'perplexity'
      };
    } catch (error) {
      console.error("Error in Perplexity Service:", error);
      throw error;
    }
  }

  // OpenAI API implementation
  private async queryOpenAI(
    query: string, 
    systemPrompt: string, 
    temperature: number, 
    maxTokens: number
  ): Promise<AIResponse> {
    const apiKey = this.apiKeys.openai;
    
    if (!apiKey) {
      return {
        content: "OpenAI API key not configured.",
        success: false,
        error: "API key not available",
        source: 'openai'
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: this.addSafetyPrompt(systemPrompt, query)
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature,
          max_tokens: maxTokens
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        success: true,
        source: 'openai'
      };
    } catch (error) {
      console.error("Error in OpenAI Service:", error);
      throw error;
    }
  }

  // Anthropic Claude implementation
  private async queryClaude(
    query: string, 
    systemPrompt: string, 
    temperature: number, 
    maxTokens: number
  ): Promise<AIResponse> {
    const apiKey = this.apiKeys.claude;
    
    if (!apiKey) {
      return {
        content: "Claude API key not configured.",
        success: false,
        error: "API key not available",
        source: 'claude'
      };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          system: this.addSafetyPrompt(systemPrompt, query),
          messages: [{
            role: 'user',
            content: query
          }],
          temperature,
          max_tokens: maxTokens
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        success: true,
        source: 'claude'
      };
    } catch (error) {
      console.error("Error in Claude Service:", error);
      throw error;
    }
  }

  // Specialized healthcare AI implementation (mock for now)
  private async querySpecializedHealthcare(
    query: string, 
    systemPrompt: string, 
    temperature: number, 
    maxTokens: number
  ): Promise<AIResponse> {
    const apiKey = this.apiKeys.specialized;
    
    if (!apiKey) {
      return {
        content: "Specialized Healthcare API key not configured.",
        success: false,
        error: "API key not available",
        source: 'specialized'
      };
    }

    // This is a placeholder for a specialized healthcare AI API
    // In a real implementation, this would connect to a dedicated healthcare AI service
    try {
      // Mock successful response for now
      return {
        content: "This is a specialized healthcare AI response about " + query,
        success: true,
        source: 'specialized'
      };
    } catch (error) {
      console.error("Error in Specialized Healthcare Service:", error);
      throw error;
    }
  }

  // Helper to detect if content violates medical safety guidelines
  private isMedicallyUnsafe(content: string): boolean {
    const lowerContent = content.toLowerCase();
    
    // Patterns that suggest unsafe medical advice
    const unsafePatterns = [
      /you can inject/i,
      /inject (at|in) home/i,
      /self.{0,10}(inject|administer)/i,
      /without.{0,10}doctor/i,
      /do.{0,10}yourself/i,
      /diy.{0,10}(treatment|procedure|surgery)/i,
      /increase.{0,10}dosage/i,
      /alternative.{0,10}(medicine|treatment).{0,30}(instead|replace)/i
    ];
    
    return unsafePatterns.some(pattern => pattern.test(content));
  }

  // Parse and validate AI responses for medical accuracy
  private containsContradictions(responses: AIResponse[]): boolean {
    // This is a simplified implementation
    // A full implementation would parse responses and check for factual disagreements
    // For now, we'll just check if any response suggests something is safe while another says it's unsafe
    
    const hasPositiveRecommendation = responses.some(r => 
      r.content.toLowerCase().includes("you can") || 
      r.content.toLowerCase().includes("it is safe") ||
      r.content.toLowerCase().includes("recommended")
    );
    
    const hasNegativeRecommendation = responses.some(r => 
      r.content.toLowerCase().includes("you should not") || 
      r.content.toLowerCase().includes("it is unsafe") ||
      r.content.toLowerCase().includes("not recommended") ||
      r.content.toLowerCase().includes("consult a doctor")
    );
    
    return hasPositiveRecommendation && hasNegativeRecommendation;
  }

  // Main method to query multiple AI providers and reconcile results
  public async askAI({ query, context = "", systemPrompt = "", temperature = 0.2, maxTokens = 1000 }: AIRequest): Promise<AIResponse> {
    // Ensure we have at least one active provider
    if (this.activeProviders.length === 0) {
      console.warn("No AI providers available");
      toast.warning("AI features limited. Please add at least one API key.");
      return {
        content: "I apologize, but I don't have access to any AI service right now. Please add an API key in your settings.",
        success: false,
        error: "No AI providers available"
      };
    }

    try {
      // Add context to the query if provided
      const fullQuery = context ? `Context: ${context}\n\nQuery: ${query}` : query;
      console.log("Querying AI with enhanced safety:", { query: fullQuery, activeProviders: this.activeProviders });
      
      // For dangerous medical topics, always use multiple providers if available
      const isDangerousQuery = this.containsDangerousMedicalContent(fullQuery);
      console.log("Query danger assessment:", isDangerousQuery);

      // If only one provider is available, use it directly
      if (this.activeProviders.length === 1 && !isDangerousQuery) {
        const provider = this.activeProviders[0];
        const response = await this.queryProvider(provider, fullQuery, systemPrompt, temperature, maxTokens);
        
        // Apply safety filter even for single provider
        if (this.isMedicallyUnsafe(response.content)) {
          return {
            content: "I apologize, but I cannot provide that information as it may involve dangerous medical procedures that should only be performed by healthcare professionals. Please consult with a qualified healthcare provider for safe and appropriate medical advice.",
            success: true,
            source: response.source
          };
        }
        
        return response;
      }
      
      // For multiple providers, query them all and compare results
      // For dangerous queries, try to use at least 2 providers if available
      const providersToUse = isDangerousQuery 
        ? this.activeProviders.slice(0, Math.max(2, this.activeProviders.length))
        : [this.activeProviders[0]]; // Just use the first provider for non-dangerous queries
      
      // Query all selected providers
      const responses = await Promise.allSettled(
        providersToUse.map(provider => 
          this.queryProvider(provider, fullQuery, systemPrompt, temperature, maxTokens)
        )
      );
      
      // Filter for successful responses
      const successfulResponses: AIResponse[] = responses
        .filter((r): r is PromiseFulfilledResult<AIResponse> => r.status === 'fulfilled')
        .map(r => r.value)
        .filter(r => r.success);
      
      if (successfulResponses.length === 0) {
        // All providers failed, return a general error
        return {
          content: "I apologize, but all AI services encountered errors. Please try again later.",
          success: false,
          error: "All providers failed"
        };
      }
      
      // Check if any response is medically unsafe
      const safeResponses = successfulResponses.filter(r => !this.isMedicallyUnsafe(r.content));
      
      if (safeResponses.length === 0) {
        // All responses were deemed unsafe
        return {
          content: "I apologize, but I cannot provide that information as it may involve dangerous medical procedures that should only be performed by healthcare professionals. Please consult with a qualified healthcare provider for safe and appropriate medical advice.",
          success: true
        };
      }
      
      // Check for contradictions between providers (only applicable for dangerous queries)
      if (isDangerousQuery && safeResponses.length > 1 && this.containsContradictions(safeResponses)) {
        return {
          content: "I've received conflicting information about your query. For your safety, I recommend consulting with a qualified healthcare provider for accurate medical advice tailored to your specific situation.",
          success: true
        };
      }
      
      // Use the first safe response, preferably from a specialized healthcare provider if available
      const specializedResponse = safeResponses.find(r => r.source === 'specialized');
      const primaryResponse = specializedResponse || safeResponses[0];
      
      return {
        content: primaryResponse.content,
        success: true,
        source: primaryResponse.source
      };
    } catch (error) {
      console.error("Error in multi-provider AI Service:", error);
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
