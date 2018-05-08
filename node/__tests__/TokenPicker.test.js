"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenPicker_1 = require("../TokenPicker");
var path = require("path");
var fs = require("fs-extra");
var fixturesDir = path.join(__dirname, 'fixtures');
fs.ensureDirSync(fixturesDir);
describe('Memory', function () {
    test('basic', function (done) {
        basicTest(done, {});
    });
    test('no duplicated tokens', function () {
        var tp = new TokenPicker_1.TokenPicker(['t1', 't1']);
        expect(tp.tokens.length).toBe(1);
    });
    test('empty', function () {
        var tp = new TokenPicker_1.TokenPicker([]);
        expect(function () { return tp.token; }).not.toThrow();
        expect(function () { return tp.expire(); }).not.toThrow();
    });
    test('do first done', function () {
        var tokens = ['t1', 't2', 't3'];
        var tp = new TokenPicker_1.TokenPicker(tokens);
        var usedToken;
        expect.assertions(1);
        tp.do(function (token, expire) {
            usedToken = token;
        });
        expect(usedToken).toBe(tp.token);
    });
    test('do second done', function () {
        var tokens = ['t1', 't2', 't3'];
        var tp = new TokenPicker_1.TokenPicker(tokens);
        var expired = false;
        expect.assertions(2);
        tp.do(function (token, expire) {
            expect(tokens).toContain(token);
            if (!expired) {
                expired = true;
                expire();
            }
        });
    });
    test('do error', function () {
        var tokens = ['t1', 't2', 't3'];
        var tp = new TokenPicker_1.TokenPicker(tokens);
        expect.assertions(tokens.length + 1); // 最后一个是 throw
        expect(function () {
            tp.do(function (token, expire) {
                expect(tokens).toContain(token);
                expire();
            });
        }).toThrowError('No available tokens');
    });
    test('do async', function (done) {
        var tokens = ['t1', 't2', 't3'];
        var tp = new TokenPicker_1.TokenPicker(tokens);
        expect.assertions(2);
        var expired = false;
        tp.do(function (token, expire) {
            expect(tokens).toContain(token);
            setTimeout(function () {
                if (!expired) {
                    expired = true;
                    expire();
                }
                else {
                    done();
                }
            }, 1);
        });
    });
});
describe('File', function () {
    var recordFile = path.join(fixturesDir, 'basic.json');
    var reloadFile = path.join(fixturesDir, 'reload.json');
    afterEach(function () { return fs.emptyDir(fixturesDir); });
    test('basic', function (done) {
        basicTest(done, { recordFile: recordFile });
    });
    test('second init', function () {
        var tokens = ['t1', 't2'];
        var tp1 = new TokenPicker_1.TokenPicker(tokens, { recordFile: recordFile });
        expect(tokens).toContain(tp1.token);
        tp1.expire();
        var tp2 = new TokenPicker_1.TokenPicker(tokens, { recordFile: recordFile });
        expect(tokens).toContain(tp2.token);
        tp2.expire();
        expect(tp1.token).not.toBeUndefined(); // tp1 没有更新，不会重复去读文件数据
        expect(tp2.token).toBeUndefined();
    });
    test('reload', function () {
        var t1 = new TokenPicker_1.TokenPicker(['t1'], { recordFile: reloadFile });
        var t2 = new TokenPicker_1.TokenPicker(['t2'], { recordFile: reloadFile });
        expect(t1.token).toBe('t1');
        expect(t2.token).toBe('t2');
        t2.expire();
        expect(t2.token).toBeUndefined();
    });
});
function basicTest(done, opts) {
    expect.assertions(5);
    var tokens = ['token1', 'token2'];
    var tp = new TokenPicker_1.TokenPicker(tokens, opts);
    expect(tokens).toContain(tp.token);
    tp.expire();
    expect(tokens).toContain(tp.token);
    tp.expire(Date.now() + 10); // 设置 10 毫秒后恢复有效
    expect(tp.token).toBeUndefined();
    setTimeout(function () {
        try {
            expect(tokens).toContain(tp.token);
            tp.expire();
            expect(tp.token).toBeUndefined();
            done();
        }
        catch (e) {
            console.log(e);
            done();
        }
    }, 200);
}
