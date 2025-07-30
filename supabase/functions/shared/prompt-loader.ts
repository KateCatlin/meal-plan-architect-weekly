import { parse } from "https://deno.land/std@0.168.0/encoding/yaml.ts";

interface PromptFile {
  name: string;
  description: string;
  model: string;
  modelParameters: {
    temperature: number;
    max_tokens: number;
  };
  messages: Array<{
    role: string;
    content: string;
  }>;
}

/**
 * Loads a YAML prompt file and processes template variables
 */
export async function loadPrompt(promptPath: string, variables: Record<string, any>): Promise<{
  messages: Array<{ role: string; content: string }>;
  modelParameters: { temperature: number; max_tokens: number };
}> {
  try {
    const promptText = await Deno.readTextFile(promptPath);
    const promptData = parse(promptText) as PromptFile;
    
    // Process template variables in messages
    const processedMessages = promptData.messages.map(message => ({
      role: message.role,
      content: processTemplate(message.content, variables)
    }));

    return {
      messages: processedMessages,
      modelParameters: promptData.modelParameters
    };
  } catch (error) {
    console.error(`Error loading prompt file ${promptPath}:`, error);
    throw new Error(`Failed to load prompt file: ${error.message}`);
  }
}

/**
 * Simple template processor for Mustache-like syntax
 * Supports {{variable}} and {{#conditionalVariable}}content{{/conditionalVariable}}
 */
function processTemplate(template: string, variables: Record<string, any>): string {
  let result = template;

  // Handle conditional blocks first: {{#variable}}content{{/variable}}
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, varName, content) => {
    const value = variables[varName];
    return (value && value !== '' && value !== 'None') ? content : '';
  });

  // Handle simple variable substitution: {{variable}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined ? String(value) : match;
  });

  return result;
}

/**
 * Gets the absolute path to a prompt file in the prompts directory
 */
export function getPromptPath(promptFileName: string): string {
  // Get the current working directory and navigate to prompts folder
  const cwd = Deno.cwd();
  return `${cwd}/prompts/${promptFileName}`;
}
