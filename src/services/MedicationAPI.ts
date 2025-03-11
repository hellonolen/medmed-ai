
import { toast } from 'sonner';

interface MedicationAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class MedicationAPI {
  private static readonly API_URL = 'https://api.medmed.ai'; // Replace with your actual API endpoint
  private static readonly TIMEOUT = 10000; // 10 seconds timeout

  // Fetch medication by ID
  static async getMedicationById(id: string): Promise<MedicationAPIResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.API_URL}/medications/${id}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching medication:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  // Search medications
  static async searchMedications(query: string): Promise<MedicationAPIResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.API_URL}/medications/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error searching medications:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  // Get medication interactions
  static async getInteractions(medicationIds: string[]): Promise<MedicationAPIResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.API_URL}/interactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ medications: medicationIds }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error checking interactions:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  // Helper method with timeout
  private static async fetchWithTimeout(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.TIMEOUT);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(id);
    }
  }

  // Fallback to local data when API fails
  static handleApiError(error: string): void {
    toast.error(`API Error: ${error}. Using local data instead.`);
    console.warn('Falling back to local data due to API error:', error);
  }
}
