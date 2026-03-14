import { tools } from './tools/index.js';
export type ToolName = keyof typeof tools;

export const executeTools = async (name: string, args: any) => {
    const tool = tools[name as ToolName];
    if (!tool?.execute) {
        return 'Unknown tool. This does not exist';
    }
    const result = await tool.execute?.(args, {
        toolCallId: '',
        messages: [],
    });
    return String(result);
};
