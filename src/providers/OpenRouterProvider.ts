import type { AIProvider, AIProviderResponse } from './AIProvider';
import { CompilerTelemetry } from '../telemetry/CompilerTelemetry';

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';

  private async fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
    const { timeout = 90000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async testConnection(apiKey: string, model: string, baseUrl: string = 'https://openrouter.ai/api/v1'): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Mirai Nikki',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5,
        }),
        timeout: 15000,
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: `API Error ${response.status}: ${text}` };
      }

      return { success: true };
    } catch (e) {
      await CompilerTelemetry.error('OpenRouterProvider', 'Connection validation failed', { error: String(e) });
      return { success: false, message: e instanceof Error ? e.message : String(e) };
    }
  }

  async compileJournal(prompt: string, userText: string, apiKey: string, model: string, baseUrl: string = 'https://openrouter.ai/api/v1'): Promise<AIProviderResponse> {
    const response = await this.fetchWithTimeout(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Mirai Nikki',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: userText }
        ],
        response_format: { type: 'json_object' }
      }),
      timeout: 90000,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter API Error: ${response.status} ${text}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model || model,
    };
  }
}
