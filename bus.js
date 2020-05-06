"use strict";
exports.__esModule = true;
var _6502_1 = require("./6502");
var Bus = /** @class */ (function () {
    function Bus() {
    }
    Bus.prototype.Bus = function () {
        this.CPU = new _6502_1.CPU6502();
        this.RAM = new ArrayBuffer(64 * 1024);
    };
    Bus.prototype.write = function (adress, data) {
        if (adress >= 0x0 && adress <= 0xffff) {
            this.RAM[adress] = data;
        }
    };
    Bus.prototype.read = function (adress, readOnly) {
        if (adress >= 0x0 && adress <= 0xffff) {
            return this.RAM[adress];
        }
        return 0x0;
    };
    return Bus;
}());
exports.Bus = Bus;
