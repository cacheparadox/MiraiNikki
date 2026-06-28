import type { AIProvider } from './AIProvider';
import { OpenRouterProvider } from './OpenRouterProvider';

class ProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    // Register built-in providers
    const openRouter = new OpenRouterProvider();
    this.providers.set(openRouter.name, openRouter);
  }

  register(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }

  get(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }
}

export const providerRegistry = new ProviderRegistry();
