window.$ = document.querySelectorAll.bind(document);
Node.prototype.on = window.on = function (name, fn, useCapture) {
    this.addEventListener(name, fn, useCapture);
};
NodeList.prototype.__proto__ = Array.prototype;
NodeList.prototype.on = NodeList.prototype.addEventListener = function (name, fn, useCapture) {
    this.forEach(function (elem, i) {
        elem.on(name, fn, useCapture);
    });
};
