// Types for the chat service
interface ChatSettings {
  forceReAct: boolean;
  maxIterations: number;
  timeoutSeconds: number;
  language: string;
  includeReasoning: boolean;
}

interface ChatRequest {
  query: string;
  conversationId: string;
  forceReAct: boolean;
  maxIterations: number;
  timeoutSeconds: number;
  language: string;
  includeReasoning: boolean;
}

interface ChatResponse {
  content: string;
  timestamp: number;
  conversationId: string;
  success: boolean;
  processingType: string;
  iterations: number;
  reasoning: string[];
  processingTimeMs: number;
  confidenceScore: number;
  chart?: any;
  error?: string;
}

interface SendMessageContext {
  configuredApis?: string[];
  conversationHistory?: any[];
  userId?: string;
}

interface SendMessageResponse {
  content: string;
  timestamp: Date;
  conversationId: string;
  success: boolean;
  processingType: string;
  iterations: number;
  reasoning: string[];
  processingTimeMs: number;
  confidenceScore: number;
  chart?: any;
  error: boolean;
}

class ChatService {
  private baseUrl: string;
  private conversationId: string | null;

  constructor() {
    this.baseUrl = '/api/chat';
    this.conversationId = null;
  }

  /**
   * Generate a new conversation ID
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send message to chat service
   */
  async sendMessage(
    message: string,
    settings: ChatSettings,
    context: SendMessageContext = {}
  ): Promise<SendMessageResponse> {
    try {
      // Generate conversation ID if not exists
      if (!this.conversationId) {
        this.conversationId = this.generateConversationId();
      }

      const requestBody: ChatRequest = {
        query: message,
        conversationId: this.conversationId,
        forceReAct: settings.forceReAct,
        maxIterations: settings.maxIterations,
        timeoutSeconds: settings.timeoutSeconds,
        language: settings.language,
        includeReasoning: settings.includeReasoning
      };

      const response = await fetch(`${this.baseUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: ChatResponse = await response.json();

      // Update conversation ID from response
      if (data.conversationId) {
        this.conversationId = data.conversationId;
      }

      return {
        content: data.content,
        timestamp: new Date(data.timestamp * 1000),
        conversationId: data.conversationId,
        success: data.success,
        processingType: data.processingType,
        iterations: data.iterations,
        reasoning: data.reasoning || [],
        processingTimeMs: data.processingTimeMs,
        confidenceScore: data.confidenceScore,
        chart: data.chart,
        error: !data.success
      };
    } catch (error) {
      console.error('Error sending message:', error);

      // Return error response in the expected format
      return {
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
        conversationId: this.conversationId || 'error',
        success: false,
        processingType: 'ERROR',
        iterations: 0,
        reasoning: [],
        processingTimeMs: 0,
        confidenceScore: 0,
        chart: null,
        error: true
      };
    }
  }

  /**
   * Send message with default settings
   */
  async sendSimpleMessage(message: string): Promise<SendMessageResponse> {
    const defaultSettings: ChatSettings = {
      forceReAct: false,
      maxIterations: 5,
      timeoutSeconds: 30,
      language: 'en',
      includeReasoning: false
    };

    return this.sendMessage(message, defaultSettings);
  }

  /**
   * Send message with ReAct enabled
   */
  async sendReActMessage(
    message: string,
    maxIterations: number = 10
  ): Promise<SendMessageResponse> {
    const reactSettings: ChatSettings = {
      forceReAct: true,
      maxIterations,
      timeoutSeconds: 60,
      language: 'en',
      includeReasoning: true
    };

    return this.sendMessage(message, reactSettings);
  }

  /**
   * Clear conversation (reset context)
   */
  clearConversation(): void {
    this.conversationId = null;
  }

  /**
   * Get current conversation ID
   */
  getConversationId(): string | null {
    return this.conversationId;
  }

  /**
   * Set conversation ID manually
   */
  setConversationId(conversationId: string): void {
    this.conversationId = conversationId;
  }

  /**
   * Check if there's an active conversation
   */
  hasActiveConversation(): boolean {
    return this.conversationId !== null;
  }

  /**
   * Get fallback suggestions when API fails
   */
  getFallbackSuggestions(apiNames: string[] = []): string[] {
    if (apiNames.length === 0) {
      return [
        "What APIs do I have configured?",
        "Show me how to get started with API integration",
        "What are best practices for API authentication?",
        "Help me create a new API request",
        "Explain different HTTP methods"
      ];
    }

    return [
      `What endpoints are available in ${apiNames[0]}?`,
      `Show me examples for ${apiNames[0]} API calls`,
      `How do I authenticate with ${apiNames[0]}?`,
      "List all configured APIs and their purposes",
      "Show me common API patterns"
    ];
  }

  /**
   * Validate chat settings
   */
  validateSettings(settings: ChatSettings): boolean {
    return (
      typeof settings.forceReAct === 'boolean' &&
      settings.maxIterations >= 1 && settings.maxIterations <= 20 &&
      settings.timeoutSeconds >= 0 &&
      settings.language.length > 0 && settings.language.length <= 5 &&
      typeof settings.includeReasoning === 'boolean'
    );
  }

  /**
   * Create default settings
   */
  static createDefaultSettings(): ChatSettings {
    return {
      forceReAct: false,
      maxIterations: 5,
      timeoutSeconds: 30,
      language: 'en',
      includeReasoning: false
    };
  }

  /**
   * Create ReAct settings
   */
  static createReActSettings(maxIterations: number = 10): ChatSettings {
    return {
      forceReAct: true,
      maxIterations,
      timeoutSeconds: 60,
      language: 'en',
      includeReasoning: true
    };
  }
}

// Export singleton instance
export const chatService = new ChatService();

// Export types for use in other files
export type {
  ChatSettings,
  ChatRequest,
  ChatResponse,
  SendMessageContext,
  SendMessageResponse
};

// Export class for testing or multiple instances
export { ChatService };