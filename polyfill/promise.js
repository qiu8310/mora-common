Promise.prototype.finally = function (callback) {
    var P = this.constructor;
    return this.then(function (value) { return P.resolve(callback()).then(function () { return value; }); }, function (reason) { return P.resolve(callback()).then(function () { throw reason; }); });
};
Promise.try = function (fn) {
    return new Promise(function (resolve, reject) {
        resolve(fn());
    });
};
