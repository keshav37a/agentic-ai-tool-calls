import { openai } from '@ai-sdk/openai';

export const webSearchTool = openai.tools.webSearch({});
