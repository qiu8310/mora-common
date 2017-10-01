export interface ITokenPickerOptions {
    recoverSeconds?: number;
    recordFile?: string;
}
export declare class TokenPicker {
    tokens: string[];
    private options;
    private currentToken;
    private config;
    constructor(tokens: string[], options?: ITokenPickerOptions);
    readonly token: string;
    expire(availableTimestamp?: number): TokenPicker;
    do(callback: (token: string, expire: (availableTimestamp?: number) => void) => void): void;
    private tokenObjects;
    private updateTokenObject(token, obj?);
    private initTokens(tokens);
}
