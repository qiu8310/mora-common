export interface ITokenPickerOptions {
    /**
     * token 超过使用限制后多长时间才能恢复；
     * 另外此值也可以在给 token 设置过期的时候单独指定
     */
    recoverSeconds?: number;
    /**
     * 指定文件路径，用于记录 token 使用信息
     */
    recordFile?: string;
}
/**
 * @example
 * let tp = new TokenPicker(['token1', 'token2'])
 *
 * while ((let token = tp.token)) {
 *  // do something
 *
 *  tp.expire() / break
 * }
 */
export declare class TokenPicker {
    tokens: string[];
    private currentToken;
    private config;
    private options;
    constructor(tokens: string[], options?: ITokenPickerOptions);
    /**
     *  获取最近未使用的 token
     */
    readonly token: string | undefined;
    /**
     * 将当前的 token 设置为过期
     * @param {number} [availableTimestamp=0] 指定下次可用的时间，不指定的话默认就是 "当前时间 + recoverSeconds"
     */
    expire(availableTimestamp?: number): TokenPicker;
    /**
     * 循环执行某个操作，直到成功或所有 token 都用完了
     *
     * 如果没有 token，会抛出异常
     */
    do(callback: (token: string, expire: (availableTimestamp?: number) => void) => void): void;
    private tokenObjects;
    private updateTokenObject(token, obj?);
    private initTokens(tokens);
}
