export interface ITokenPickerOptions {
    recoverSeconds?: number;
    recordFile?: string;
}
export declare class TokenPicker {
    tokens: string[];
    private currentToken;
    private config;
    private options;
    constructor(tokens: string[], options?: ITokenPickerOptions);
    readonly token: string | undefined;
    expire(availableTimestamp?: number): TokenPicker;
    do(callback: (token: string, expire: (availableTimestamp?: number) => void) => void): void;
    private tokenObjects;
    private updateTokenObject(token, obj?);
    private initTokens(tokens);
}
