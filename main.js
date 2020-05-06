"use strict";
exports.__esModule = true;
var bus_1 = require("./bus");
var _6502_1 = require("./6502");
console.clear();
console.log("TSNES emulator");
var cpu = new _6502_1.CPU6502();
cpu.connectBus(new bus_1.Bus());
