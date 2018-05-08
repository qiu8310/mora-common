"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * 很多 API 接口需要使用 token 去拉数据，
 * 每个 token 限制了请求次数，次数用完了
 * 就不能使用，要过一定时间才能用，要么你
 * 只能换 token
 *
 * 此脚本是方便用户同时提供多个 token，此程序会动态调用对应的
 * token，如果某个 token 到期了，则会把它放入过期列表中，只有
 * 时间到了才会重新启用
 */
var assign = require("mora-scripts/libs/lang/assign");
var Config = require("mora-scripts/libs/storage/Config");
var Storage = require("mora-scripts/libs/storage/Storage");
var FileStorage = require("mora-scripts/libs/storage/FileStorage");
var DEFAULT_RECOVER_SECONDS = 30 * 24 * 3600;
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
var TokenPicker = /** @class */ (function () {
    function TokenPicker(tokens, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.tokens = [];
        var storageOpts = { format: 2, autoInit: true };
        var storage = options.recordFile
            ? new FileStorage(tslib_1.__assign({}, storageOpts, { file: options.recordFile }))
            : new Storage(storageOpts);
        this.config = new Config(storage);
        this.options = options;
        tokens.forEach(function (t) {
            if (_this.tokens.indexOf(t) < 0)
                _this.tokens.push(t);
        });
        this.initTokens(this.tokens);
    }
    Object.defineProperty(TokenPicker.prototype, "token", {
        /**
         *  获取最近未使用的 token
         */
        get: function () {
            var _a = this, tokenObjects = _a.tokenObjects, currentToken = _a.currentToken;
            if (currentToken)
                return currentToken;
            var now = Date.now();
            var availableTokenObjects = tokenObjects
                .filter(function (obj) { return now > obj.availableTimestamp; })
                .sort(function (a, b) { return a.lastUsedTimestamp - b.lastUsedTimestamp; });
            if (!availableTokenObjects.length)
                return;
            this.currentToken = availableTokenObjects[0].token;
            availableTokenObjects[0].lastUsedTimestamp = now;
            this.tokenObjects = tokenObjects;
            return this.currentToken;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 将当前的 token 设置为过期
     * @param {number} [availableTimestamp=0] 指定下次可用的时间，不指定的话默认就是 "当前时间 + recoverSeconds"
     */
    TokenPicker.prototype.expire = function (availableTimestamp) {
        if (availableTimestamp === void 0) { availableTimestamp = 0; }
        if (this.currentToken) {
            this.updateTokenObject(this.currentToken, { availableTimestamp: availableTimestamp || Date.now() + (this.options.recoverSeconds || DEFAULT_RECOVER_SECONDS) * 1000 });
            this.currentToken = null;
        }
        return this;
    };
    /**
     * 循环执行某个操作，直到成功或所有 token 都用完了
     *
     * 如果没有 token，会抛出异常
     */
    TokenPicker.prototype.do = function (callback) {
        var _this = this;
        var next = function () {
            var token = _this.token;
            if (token) {
                callback(token, function (availableTimestamp) {
                    _this.expire(availableTimestamp);
                    next();
                });
            }
            else {
                throw new Error('No available tokens');
            }
        };
        next();
    };
    Object.defineProperty(TokenPicker.prototype, "tokenObjects", {
        get: function () {
            return this.config.get('tokens') || [];
        },
        set: function (tokens) {
            this.config.set('tokens', tokens);
        },
        enumerable: true,
        configurable: true
    });
    TokenPicker.prototype.updateTokenObject = function (token, obj) {
        var tokenObjects = this.tokenObjects;
        assign(tokenObjects.filter(function (o) { return o.token === token; })[0], obj);
        this.tokenObjects = tokenObjects;
    };
    TokenPicker.prototype.initTokens = function (tokens) {
        var tokenObjectsMap = this.tokenObjects.reduce(function (map, obj) {
            map[obj.token] = obj;
            return map;
        }, {});
        tokens.forEach(function (token) {
            if (!tokenObjectsMap.hasOwnProperty(token)) {
                tokenObjectsMap[token] = { token: token, lastUsedTimestamp: 0, availableTimestamp: 0 };
            }
        });
        this.tokenObjects = tokens.map(function (token) { return tokenObjectsMap[token]; });
    };
    return TokenPicker;
}());
exports.TokenPicker = TokenPicker;
