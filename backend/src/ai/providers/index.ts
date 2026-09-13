import { config } from '../../config/env';
import { AIProvider } from './AIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { MockAIProvider } from './MockAIProvider';

export function getAIProvider(): AIProvider {
  if (config.openaiApiKey && config.openaiApiKey.trim().length > 0) {
    return new OpenAIProvider(config.openaiApiKey, config.openaiModel);
  }
  return new MockAIProvider();
}

export * from './AIProvider';
export * from './MockAIProvider';
export * from './OpenAIProvider';
