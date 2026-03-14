import 'dotenv/config';
import { generateText, type ModelMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { SYSTEM_PROMPT } from './system/prompt';
import type { AgentCallbacks } from '../types';
import { tools } from './tools';
import { executeTools } from './executeTools';

const MODEL_NAME = 'gpt-5-mini';

export const runAgent = async (userMessage: string, conversationHistory: ModelMessage[], callbacks: AgentCallbacks) => {
    const { toolCalls } = await generateText({
        model: openai(MODEL_NAME),
        prompt: userMessage,
        system: SYSTEM_PROMPT,
        tools,
    });

    for (const toolCall of toolCalls) {
        const { toolName, input } = toolCall;
        const result = await executeTools(toolName, input);
        console.log('result: ', result);
    }
};

runAgent('What is the current time right now');
