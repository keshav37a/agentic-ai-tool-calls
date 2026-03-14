import 'dotenv/config';
import { generateText, type ModelMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getTracer, Laminar } from '@lmnr-ai/lmnr';
import { SYSTEM_PROMPT } from './system/prompt.js';
import type { AgentCallbacks } from '../types.js';
import { tools } from './tools/index.js';
import { executeTools } from './executeTools.js';

const MODEL_NAME = 'gpt-5-mini';

Laminar.initialize({
    projectApiKey: process.env.LMNR_PROJECT_API_KEY,
});

export const runAgent = async (userMessage: string, conversationHistory: ModelMessage[], callbacks: AgentCallbacks) => {
    const { toolCalls } = await generateText({
        model: openai(MODEL_NAME),
        prompt: userMessage,
        system: SYSTEM_PROMPT,
        tools,
        experimental_telemetry: {
            isEnabled: true,
            tracer: getTracer(),
        },
    });

    for (const toolCall of toolCalls) {
        const { toolName, input } = toolCall;
        const result = await executeTools(toolName, input);
        console.log('result: ', result);
    }

    await Laminar.flush();
};

runAgent('What is the current time right now');
