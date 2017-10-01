"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assign = require("mora-scripts/libs/lang/assign");
var Config = require("mora-scripts/libs/storage/Config");
var Storage = require("mora-scripts/libs/storage/Storage");
var FileStorage = require("mora-scripts/libs/storage/FileStorage");
var TokenPicker = (function () {
    function TokenPicker(tokens, options) {
        var _this = this;
        this.tokens = [];
        this.options = {
            recoverSeconds: 30 * 24 * 3600,
            recordFile: null
        };
        options = assign(this.options, options);
        var storageOpts = { format: 2, autoInit: true, file: options.recordFile };
        var storage = options.recordFile ? new FileStorage(storageOpts) : new Storage(storageOpts);
        this.config = new Config(storage);
        this.options = options;
        tokens.forEach(function (t) {
            if (_this.tokens.indexOf(t) < 0)
                _this.tokens.push(t);
        });
        this.initTokens(this.tokens);
    }
    Object.defineProperty(TokenPicker.prototype, "token", {
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
    TokenPicker.prototype.expire = function (availableTimestamp) {
        if (availableTimestamp === void 0) { availableTimestamp = 0; }
        if (this.currentToken) {
            this.updateTokenObject(this.currentToken, { availableTimestamp: availableTimestamp || Date.now() + this.options.recoverSeconds * 1000 });
            this.currentToken = null;
        }
        return this;
    };
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
