export interface AIProviderResponse {
  content: string;
  model: string;
}

export interface AIProvider {
  name: string;
  testConnection(apiKey: string, model: string, baseUrl?: string): Promise<{ success: boolean; message?: string }>;
  compileJournal(prompt: string, userText: string, apiKey: string, model: string, baseUrl?: string): Promise<AIProviderResponse>;
}
