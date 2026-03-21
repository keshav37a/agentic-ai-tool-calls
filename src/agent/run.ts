import 'dotenv/config';

import { openai } from '@ai-sdk/openai';
import { getTracer, Laminar } from '@lmnr-ai/lmnr';
import { streamText, type ModelMessage } from 'ai';

import { SYSTEM_PROMPT } from './system/prompt.js';
import { tools } from './tools/index.js';
import { executeTools } from './executeTools.js';

import type { AgentCallbacks, ToolCallInfo } from '../types.js';

const MODEL_NAME = 'gpt-5-mini';

Laminar.initialize({
    projectApiKey: process.env.LMNR_PROJECT_API_KEY,
});

const filterCompatibleMessages = (messages: ModelMessage[]): ModelMessage[] => {
    return messages.filter((msg) => {
        // Keep user and system messages
        if (msg.role === 'user' || msg.role === 'system') {
            return true;
        }

        // Keep assistant messages that have text content
        if (msg.role === 'assistant') {
            const content = msg.content;
            if (typeof content === 'string' && content.trim()) {
                return true;
            }
            // Check for array content with text parts
            if (Array.isArray(content)) {
                const hasTextContent = content.some((part: unknown) => {
                    if (typeof part === 'string' && part.trim()) return true;
                    if (typeof part === 'object' && part !== null && 'text' in part) {
                        const textPart = part as { text?: string };
                        return textPart.text && textPart.text.trim();
                    }
                    return false;
                });
                return hasTextContent;
            }
        }

        // Keep tool messages
        if (msg.role === 'tool') {
            return true;
        }

        return false;
    });
};

export const runAgent = async (userMessage: string, conversationHistory: ModelMessage[], callbacks: AgentCallbacks) => {
    const workingHistory = filterCompatibleMessages(conversationHistory);
    const messages: ModelMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...workingHistory,
        { role: 'user', content: userMessage },
    ];

    let fullResponse = '';

    while (true) {
        const result = streamText({
            model: openai(MODEL_NAME),
            messages,
            tools,
            experimental_telemetry: {
                isEnabled: true,
                tracer: getTracer(),
            },
        });

        const toolCalls: ToolCallInfo[] = [];
        let currentText = '';
        let streamError: Error | null = null;

        try {
            for await (const chunk of result.fullStream) {
                if (chunk.type === 'text-delta') {
                    callbacks?.onToken(chunk.text);
                    currentText += chunk.text;
                } else if (chunk.type === 'tool-call') {
                    const input = 'input' in chunk ? chunk.input : {};
                    const { toolCallId, toolName } = chunk;
                    callbacks?.onToolCallStart(toolName, input);
                    toolCalls.push({
                        toolCallId,
                        toolName,
                        args: input as any,
                    });
                }
            }
        } catch (e) {
            streamError = e as Error;
            if (!currentText && !streamError?.message?.includes('no output generated')) {
                throw streamError;
            }
        }

        // If stream errored with "no output" and we have no text, try to recover
        if (streamError && !currentText) {
            // Add a fallback response
            fullResponse =
                "I apologize, but I wasn't able to generate a response. Could you please try rephrasing your message?";
            callbacks?.onToken(fullResponse);
            break;
        }

        const finishReason = await result.finishReason;
        const responseMessages = await result.response;

        fullResponse += currentText;

        messages.push(...responseMessages.messages);

        if (finishReason !== 'tool-calls' || toolCalls.length === 0) {
            break;
        }

        for (const tc of toolCalls) {
            const { toolCallId, toolName, args } = tc;
            const result = await executeTools(toolName, args);

            callbacks?.onToolCallEnd(toolName, result);

            messages.push({
                role: 'tool',
                content: [
                    {
                        type: 'tool-result',
                        toolCallId,
                        toolName,
                        output: { type: 'text', value: result },
                    },
                ],
            });
        }
    }

    await Laminar.flush();

    callbacks?.onComplete?.(fullResponse);
    return messages;
};
