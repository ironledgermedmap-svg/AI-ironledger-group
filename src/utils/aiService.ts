import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, showApiKeyWarning } from './apiConfig';

export interface AIGenerationOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class AIService {
  private ai: GoogleGenAI | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        showApiKeyWarning();
        return;
      }

      this.ai = new GoogleGenAI({ apiKey });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  async generateContent(prompt: string, options: AIGenerationOptions = {}): Promise<string> {
    if (!this.isInitialized || !this.ai) {
      throw new Error('AI service not properly initialized. Check your API key configuration.');
    }

    try {
      const response = await this.ai.models.generateContent({
        model: options.model || 'gemini-2.0-flash-001',
        contents: prompt,
        // Add any additional options here
      });

      if (!response || !response.text) {
        throw new Error('Empty response from AI service');
      }

      return response.text;
    } catch (error) {
      console.error('AI content generation failed:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Invalid API key. Please check your Gemini API key configuration.');
        }
        if (error.message.includes('quota')) {
          throw new Error('API quota exceeded. Please check your Gemini API usage limits.');
        }
        if (error.message.includes('model')) {
          throw new Error('Invalid model specified. Please check the model name.');
        }
      }
      
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && this.ai !== null;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const testResponse = await this.generateContent('Hello! Please respond with just "OK" to confirm the connection.', {
        model: 'gemini-2.0-flash-001'
      });
      return testResponse.includes('OK') || testResponse.includes('ok');
    } catch (error) {
      console.error('AI service connection test failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();
