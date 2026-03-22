export interface AgentCallbacks {
    onToken: (token: string) => void;
    onToolCallStart: (name: string, args: unknown) => void;
    onToolCallEnd: (name: string, result: string) => void;
    onComplete: (response: string) => void;
    onTokenUsage: (usage: TokenUsageInfo) => void;
}

export interface ModelLimits {
    inputLimit: number;
    outputLimit: number;
    contextWindow: number;
}

export interface ToolCallInfo {
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
}

export interface TokenUsageInfo {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    contextWindow: number;
    threshold: number;
    percentage: number;
}
