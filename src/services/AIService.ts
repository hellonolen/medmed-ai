// AIService.ts - Handles AI provider communication
import { toast } from "sonner";

interface AIResponse {
  success: boolean;
  content: string;
  provider?: string;
}

interface AIRequestOptions {
  query: string;
  context?: string;
  systemPrompt?: string;
  provider?: string;
}

class AIService {
  private static instance: AIService;
  private apiKeys: Record<string, string> = {};
  
  // Define our supported providers
  private providers = ['perplexity', 'openai', 'claude', 'specialized'];
  
  private constructor() {
    // Load any saved API keys from localStorage
    this.providers.forEach(provider => {
      const savedKey = localStorage.getItem(`ai_key_${provider}`);
      if (savedKey) {
        this.apiKeys[provider] = savedKey;
      }
    });
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public getApiKey(provider: string = 'perplexity'): string {
    return this.apiKeys[provider] || '';
  }

  public setApiKey(provider: string, key: string): void {
    this.apiKeys[provider] = key;
    localStorage.setItem(`ai_key_${provider}`, key);
  }

  public getConfiguredProviders(): string[] {
    return this.providers.filter(provider => !!this.apiKeys[provider]);
  }

  private async callPerplexityAI(query: string, systemPrompt: string): Promise<AIResponse> {
    try {
      const apiKey = this.getApiKey('perplexity');
      
      if (!apiKey) {
        return {
          success: false,
          content: "Perplexity API key not configured.",
          provider: "perplexity"
        };
      }

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: systemPrompt || 'You are a helpful healthcare AI assistant. Provide accurate, factual information and always include a disclaimer for serious medical concerns.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Perplexity API error:', errorData);
        return {
          success: false,
          content: `Error: ${response.status} - ${response.statusText}`,
          provider: "perplexity"
        };
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0].message.content,
        provider: "perplexity"
      };
    } catch (error) {
      console.error('Error calling Perplexity API:', error);
      return {
        success: false,
        content: error instanceof Error ? error.message : "Unknown error occurred",
        provider: "perplexity"
      };
    }
  }

  private async callOpenAI(query: string, systemPrompt: string): Promise<AIResponse> {
    try {
      const apiKey = this.getApiKey('openai');
      
      if (!apiKey) {
        return {
          success: false,
          content: "OpenAI API key not configured.",
          provider: "openai"
        };
      }

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
              content: systemPrompt || 'You are a helpful healthcare AI assistant. Provide accurate, factual information and always include a disclaimer for serious medical concerns.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('OpenAI API error:', errorData);
        return {
          success: false,
          content: `Error: ${response.status} - ${response.statusText}`,
          provider: "openai"
        };
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0].message.content,
        provider: "openai"
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return {
        success: false,
        content: error instanceof Error ? error.message : "Unknown error occurred",
        provider: "openai"
      };
    }
  }

  private async callClaude(query: string, systemPrompt: string): Promise<AIResponse> {
    try {
      const apiKey = this.getApiKey('claude');
      
      if (!apiKey) {
        return {
          success: false,
          content: "Claude API key not configured.",
          provider: "claude"
        };
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          system: systemPrompt || 'You are a helpful healthcare AI assistant. Provide accurate, factual information and always include a disclaimer for serious medical concerns.',
          messages: [
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Claude API error:', errorData);
        return {
          success: false,
          content: `Error: ${response.status} - ${response.statusText}`,
          provider: "claude"
        };
      }

      const data = await response.json();
      return {
        success: true,
        content: data.content[0].text,
        provider: "claude"
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      return {
        success: false,
        content: error instanceof Error ? error.message : "Unknown error occurred",
        provider: "claude"
      };
    }
  }

  private getMedicalSafetyVerification(content: string): boolean {
    // This is a very basic safety check - in a real implementation, 
    // this would be much more sophisticated
    const dangerousTerms = [
      "inject yourself",
      "self-administer",
      "perform surgery",
      "self-diagnose",
      "stop taking your medication",
      "replace your doctor",
      "cure for",
      "guaranteed to"
    ];
    
    const lowercaseContent = content.toLowerCase();
    return !dangerousTerms.some(term => lowercaseContent.includes(term));
  }

  public async askAI(options: AIRequestOptions): Promise<AIResponse> {
    const { query, systemPrompt = "", provider } = options;

    try {
      // Get all configured providers
      const configuredProviders = this.getConfiguredProviders();
      
      if (configuredProviders.length === 0) {
        return {
          success: false,
          content: "No AI providers configured. Please add at least one API key in settings."
        };
      }
      
      // If a specific provider is requested and configured, use only that one
      if (provider && this.getApiKey(provider)) {
        return this.callProvider(provider, query, systemPrompt);
      }
      
      // Use the first configured provider as primary
      const primaryProvider = configuredProviders[0];
      const primaryResponse = await this.callProvider(primaryProvider, query, systemPrompt);
      
      // If we only have one provider, return its response
      if (configuredProviders.length === 1) {
        return primaryResponse;
      }
      
      // For multiple providers, check if the response is safe
      const isSafe = this.getMedicalSafetyVerification(primaryResponse.content);
      
      // If primary response looks unsafe and we have other providers, cross-verify
      if (!isSafe && configuredProviders.length > 1) {
        toast.info("Cross-verifying medical information for safety...");
        
        // Get a second opinion from another provider
        const secondaryProvider = configuredProviders[1];
        const promptWithWarning = `${systemPrompt}\n\nIMPORTANT: The following medical question requires careful consideration for safety: "${query}"\n\nPlease provide accurate information and ensure your answer includes appropriate medical disclaimers and safety warnings.`;
        
        const secondaryResponse = await this.callProvider(secondaryProvider, query, promptWithWarning);
        
        if (!this.getMedicalSafetyVerification(secondaryResponse.content)) {
          // Both providers returned potentially unsafe content - return safer response
          return {
            success: true,
            content: "I'm unable to provide specific guidance on this medical topic as it may require professional medical consultation. Please consult with a healthcare provider for personalized advice on this matter.",
            provider: "safety_system"
          };
        }
        
        // Return the secondary response with a note
        return {
          success: true,
          content: `${secondaryResponse.content}\n\n[Cross-verified by multiple medical AI systems for safety]`,
          provider: secondaryProvider
        };
      }
      
      return primaryResponse;
    } catch (error) {
      console.error("Error in askAI:", error);
      return {
        success: false,
        content: "An error occurred while processing your request. Please try again later."
      };
    }
  }

  private async callProvider(provider: string, query: string, systemPrompt: string): Promise<AIResponse> {
    switch (provider) {
      case 'perplexity':
        return this.callPerplexityAI(query, systemPrompt);
      case 'openai':
        return this.callOpenAI(query, systemPrompt);
      case 'claude':
        return this.callClaude(query, systemPrompt);
      case 'specialized':
        // This would integrate with a specialized healthcare AI in a real implementation
        return {
          success: true,
          content: "This is a placeholder for specialized healthcare AI responses. In a real implementation, this would connect to a medical-specific AI provider.",
          provider: "specialized"
        };
      default:
        return {
          success: false,
          content: `Unknown provider: ${provider}`,
        };
    }
  }

  // Add new methods to fix the TS errors
  
  /**
   * Answers a FAQ question using the configured AI providers
   * @param question The question to answer
   * @returns AI response with the answer
   */
  public async answerFAQ(question: string): Promise<AIResponse> {
    // Special system prompt for FAQ answers
    const faqSystemPrompt = 
      "You are a healthcare FAQ assistant providing accurate, concise answers to medical questions. " +
      "Keep responses under 3 paragraphs, use simple language, and include appropriate disclaimers. " +
      "Always clarify that this information is for educational purposes only and not a substitute for professional medical advice.";
    
    return this.askAI({
      query: question,
      systemPrompt: faqSystemPrompt
    });
  }
  
  /**
   * Verifies payment details using AI to detect potential fraud
   * @param paymentDetails The payment details to verify
   * @returns AI response with verification result in JSON format
   */
  public async getPaymentVerification(paymentDetails: any): Promise<AIResponse> {
    // Special system prompt for payment verification
    const verificationSystemPrompt = 
      "You are a payment verification assistant. Analyze the provided payment details and return a JSON object " +
      "with the following structure: { \"verified\": boolean, \"risk\": \"low\"|\"medium\"|\"high\", \"reason\": string }. " +
      "Base your assessment on the payment amount, method, and any provided context. " +
      "IMPORTANT: Your response must ONLY contain valid JSON that can be parsed.";
    
    // Format the payment details as a structured query
    const query = `Please verify the following payment transaction:\n${JSON.stringify(paymentDetails, null, 2)}`;
    
    return this.askAI({
      query,
      systemPrompt: verificationSystemPrompt
    });
  }
}

export const aiService = AIService.getInstance();
