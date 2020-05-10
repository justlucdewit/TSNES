// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"6502.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var Flags;

(function (Flags) {
  Flags[Flags["C"] = 0] = "C";
  Flags[Flags["Z"] = 1] = "Z";
  Flags[Flags["I"] = 2] = "I";
  Flags[Flags["D"] = 3] = "D";
  Flags[Flags["B"] = 4] = "B";
  Flags[Flags["U"] = 5] = "U";
  Flags[Flags["V"] = 6] = "V";
  Flags[Flags["N"] = 7] = "N";
})(Flags || (Flags = {}));

var CPU6502 =
/** @class */
function () {
  function CPU6502() {
    var _this = this;

    this.fetched = 0;
    this.addr_rel = 0;
    this.addr_abs = 0;
    this.opcode = 0;
    this.cycles = 0;
    this.status = 0x00;
    this.totalCycles = 0; // registers

    this.flags = {
      C: false,
      Z: false,
      I: false,
      D: false,
      B: false,
      U: false,
      V: false,
      N: false
    };
    this.pc = 0;
    this.sp = 0;
    this.a = 0;
    this.x = 0;
    this.y = 0; // adressing modes

    this.IMP = function () {
      // implied
      _this.fetched = _this.a;
      return 0;
    };

    this.IMM = function () {
      // immediate
      _this.addr_abs = _this.pc;
      _this.pc++;
      return 0;
    };

    this.ZP0 = function () {
      // zero page
      _this.addr_abs = _this.read(_this.pc) & 0x00ff;
      _this.pc++;
      return 0;
    };

    this.ZPX = function () {
      // zero page with offset from X register
      _this.addr_abs = _this.read(_this.pc + _this.x) & 0x00ff;
      _this.pc++;
      return 0;
    };

    this.ZPY = function () {
      // zero page with offset from Y register
      _this.addr_abs = _this.read(_this.pc + _this.y) & 0x00ff;
      _this.pc++;
      return 0;
    };

    this.REL = function () {
      // relative
      _this.addr_rel = _this.read(_this.pc);
      _this.pc++;

      if (_this.addr_rel & 0x80) {
        _this.addr_rel = -128 + (_this.addr_rel ^ 0x80);
      }

      return 0;
    };

    this.ABS = function () {
      // absolute
      var low = _this.read(_this.pc);

      _this.pc++;

      var high = _this.read(_this.pc);

      _this.pc++;
      _this.addr_abs = high << 8 | low;
      return 0;
    };

    this.ABX = function () {
      // absolute with offset from X register
      var low = _this.read(_this.pc);

      _this.pc++;

      var high = _this.read(_this.pc);

      _this.pc++;
      _this.addr_abs = (high << 8 | low) + _this.x;

      if ((_this.addr_abs & 0xff00) != high << 8) {
        return 1;
      }

      return 0;
    };

    this.ABY = function () {
      // absolute with offset from Y register
      var low = _this.read(_this.pc);

      _this.pc++;

      var high = _this.read(_this.pc);

      _this.pc++;
      _this.addr_abs = (high << 8 | low) + _this.y;

      if ((_this.addr_abs & 0xff00) != high << 8) {
        return 1;
      }

      return 0;
    };

    this.IND = function () {
      // indirect
      var ptr_low = _this.read(_this.pc);

      _this.pc++;

      var ptr_high = _this.read(_this.pc);

      _this.pc++;
      var ptr = ptr_high << 8 | ptr_low;

      if (ptr_low === 0x00ff) {
        // page boundary hard ware bug
        _this.addr_abs = _this.read(ptr << 8) | _this.read(ptr + 1);
      } else {
        _this.addr_abs = _this.read(ptr + 1 << 8) | _this.read(ptr + 1);
      }

      return 0;
    };

    this.IZX = function () {
      // indirect zeropage offset from X
      var t = _this.read(_this.pc);

      _this.pc++;

      var low = _this.read(t & 0x00ff);

      var high = _this.read(t + 1 & 0x00ff);

      _this.addr_abs = (high << 8 | low) + _this.x;

      if ((_this.addr_abs & 0xff00) != high << 8) {
        return 1;
      } else {
        return 0;
      }
    };

    this.IZY = function () {
      // indirect zeropage offset from Y
      var t = _this.read(_this.pc);

      _this.pc++;

      var low = _this.read(t & 0x00ff);

      var high = _this.read(t + 1 & 0x00ff);

      _this.addr_abs = (high << 8 | low) + _this.y;

      if ((_this.addr_abs & 0xff00) != high << 8) {
        return 1;
      } else {
        return 0;
      }
    };

    this.cycle = function () {
      if (_this.cycles === 0) {
        _this.opcode = _this.read(_this.pc);
        _this.pc++;
        _this.cycles = _this.lookup[_this.opcode][2]; // set needed cycle count

        var extraCycles1 = _this.lookup[_this.opcode][1](); // setup address mode


        var extraCycles2 = _this.lookup[_this.opcode][0](); // execute instuction


        _this.cycles += extraCycles1 & extraCycles2;
      }

      _this.cycles--;
      _this.totalCycles++;
    };

    this.reset = function () {
      _this.a = 0;
      _this.x = 0;
      _this.y = 0;
      _this.sp = 0xfd;
      _this.status = 0x00 | (_this.flags.U ? 1 : 0);
      _this.addr_abs = 0xfffc;

      var low = _this.read(_this.addr_abs);

      var high = _this.read(_this.addr_abs + 1);

      _this.pc = high << 8 | low;
      _this.addr_rel = 0x0000;
      _this.addr_abs = 0x0000;
      _this.fetched = 0x00;
      _this.cycles = 8;
    };

    this.requestInterupt = function () {
      if (!_this.GetFlag(Flags.I)) {
        _this.write(0x0100 + _this.sp, _this.pc >> 8 & 0x00ff);

        _this.sp--;

        _this.write(0x0100 + _this.sp, _this.pc & 0x00ff);

        _this.sp--;

        _this.SetFlag(Flags.B, false);

        _this.SetFlag(Flags.U, true);

        _this.SetFlag(Flags.I, true);

        _this.write(0x0100 + _this.sp, _this.status);

        _this.sp--;
        _this.addr_abs = 0xfffe;

        var low = _this.read(_this.addr_abs);

        var high = _this.read(_this.addr_abs + 1);

        _this.pc = high << 8 | low;
        _this.cycles = 7;
      }
    };

    this.nonMascableInterupt = function () {
      _this.write(0x0100 + _this.sp, _this.pc >> 8 & 0x00ff);

      _this.sp--;

      _this.write(0x0100 + _this.sp, _this.pc & 0x00ff);

      _this.sp--;

      _this.SetFlag(Flags.B, false);

      _this.SetFlag(Flags.U, true);

      _this.SetFlag(Flags.I, true);

      _this.write(0x0100 + _this.sp, _this.status);

      _this.sp--;
      _this.addr_abs = 0xfffe;

      var low = _this.read(_this.addr_abs);

      var high = _this.read(_this.addr_abs + 1);

      _this.pc = high << 8 | low;
      _this.cycles = 8;
    };

    this.fetch = function () {
      if (!(_this.lookup[_this.opcode][1] == _this.IMP)) {
        // current opcode isnt in imply mode
        _this.fetched = _this.read(_this.addr_abs);
      }
    }; //opcodes


    this.ADC = function () {
      // addition to acc
      _this.fetch();

      var result = _this.a + _this.fetched + (_this.GetFlag(Flags.C) ? 1 : 0);

      _this.SetFlag(Flags.C, result > 255); // set carry bit


      _this.SetFlag(Flags.Z, (result & 0x00ff) == 0); // set zero flag


      _this.SetFlag(Flags.N, (result & 0x80) != 0); // negative flag


      _this.SetFlag(Flags.V, (~(_this.a ^ _this.fetched) & (_this.a ^ result) & 0x0080) != 0); // set overflow flag


      _this.a = result & 0x00ff;
      return 1;
    };

    this.AND = function () {
      // bitwise and
      _this.fetch();

      _this.a &= _this.fetched;

      _this.SetFlag(Flags.Z, _this.a === 0x00 ? true : false); // zero flag


      _this.SetFlag(Flags.N, _this.a & 0x80 ? true : false); // negative flag


      return 1;
    };

    this.ASL = function () {
      return 0;
    };

    this.BCC = function () {
      // branch if carry clear
      if (!_this.GetFlag(Flags.C)) {
        _this.cycles++;
        _this.addr_abs = _this.pc + _this.addr_rel;

        if ((_this.addr_abs & 0xff00) != (_this.pc & 0xff00)) {
          _this.cycles++;
        }

        _this.pc = _this.addr_abs;
      }

      return 0;
    };

    this.BCS = function () {
      // branch if carry
      if (_this.GetFlag(Flags.C)) {
        _this.cycles++;
        _this.addr_abs = _this.pc + _this.addr_rel;

        if ((_this.addr_abs & 0xff00) != (_this.pc & 0xff00)) {
          _this.cycles++;
        }

        _this.pc = _this.addr_abs;
      }

      return 0;
    };

    this.BEQ = function () {
      // branch if equal
      if (_this.GetFlag(Flags.Z)) {
        _this.cycles++;
        _this.addr_abs = _this.pc + _this.addr_rel;

        if ((_this.addr_abs & 0xff00) != (_this.pc & 0xff00)) {
          _this.cycles++;
        }

        _this.pc = _this.addr_abs;
      }

      return 0;
    };

    this.BIT = function () {
      return 0;
    };

    this.BMI = function () {
      // branch if negative
      if (_this.GetFlag(Flags.N)) {
        _this.cycles++;
        _this.addr_abs = _this.pc + _this.addr_rel;

        if ((_this.addr_abs & 0xff00) != (_this.pc & 0xff00)) {
          _this.cycles++;
        }

        _this.pc = _this.addr_abs;
      }

      return 0;
    };

    this.BNE = function () {
      // branch if not equal
      if (!_this.GetFlag(Flags.Z)) {
        _this.cycles++;
        _this.addr_abs = _this.pc + _this.addr_rel;

        if ((_this.addr_abs & 0xff00) != (_this.pc & 0xff00)) {
          _this.cycles++;
        }

        _this.pc = _this.addr_abs;
      }

      return 0;
    };

    this.BPL = function () {
      // branch if not equal
      if (!_this.GetFlag(Flags.N)) {
        _this.cycles++;
        _this.addr_abs = _this.pc + _this.addr_rel;

        if ((_this.addr_abs & 0xff00) != (_this.pc & 0xff00)) {
          _this.cycles++;
        }

        _this.pc = _this.addr_abs;
      }

      return 0;
    };

    this.BRK = function () {
      return 0;
    };

    this.BVC = function () {
      // branch if overflow
      if (!_this.GetFlag(Flags.V)) {
        _this.cycles++;
        _this.addr_abs = _this.pc + _this.addr_rel;

        if ((_this.addr_abs & 0xff00) != (_this.pc & 0xff00)) {
          _this.cycles++;
        }

        _this.pc = _this.addr_abs;
      }

      return 0;
    };

    this.BVS = function () {
      // branch if not overflow
      if (_this.GetFlag(Flags.V)) {
        _this.cycles++;
        _this.addr_abs = _this.pc + _this.addr_rel;

        if ((_this.addr_abs & 0xff00) != (_this.pc & 0xff00)) {
          _this.cycles++;
        }

        _this.pc = _this.addr_abs;
      }

      return 0;
    };

    this.CLC = function () {
      // clear cary
      _this.SetFlag(Flags.C, false);

      return 0;
    };

    this.CLD = function () {
      // clear decimal mode
      _this.SetFlag(Flags.D, false);

      return 0;
    };

    this.CLI = function () {
      //clear disable interupts
      _this.SetFlag(Flags.I, false);

      return 0;
    };

    this.CLV = function () {
      // clear overflow
      _this.SetFlag(Flags.V, false);

      return 0;
    };

    this.CMP = function () {
      return 0;
    };

    this.CPX = function () {
      return 0;
    };

    this.CPY = function () {
      return 0;
    };

    this.DEC = function () {
      return 0;
    };

    this.DEX = function () {
      // decrement X
      _this.x--;

      _this.SetFlag(Flags.Z, _this.x === 0x00);

      _this.SetFlag(Flags.N, (_this.x & 0x80) !== 0);

      return 0;
    };

    this.DEY = function () {
      // decrement Y
      _this.y--;

      _this.SetFlag(Flags.Z, _this.y === 0x00);

      _this.SetFlag(Flags.N, (_this.y & 0x80) !== 0);

      return 0;
    };

    this.EOR = function () {
      return 0;
    };

    this.INC = function () {
      return 0;
    };

    this.INX = function () {
      // increment X
      _this.x++;

      _this.SetFlag(Flags.Z, _this.x === 0x00);

      _this.SetFlag(Flags.N, (_this.x & 0x80) !== 0);

      return 0;
    };

    this.INY = function () {
      // increment Y
      _this.y++;

      _this.SetFlag(Flags.Z, _this.y === 0x00);

      _this.SetFlag(Flags.N, (_this.y & 0x80) !== 0);

      return 0;
    };

    this.JMP = function () {
      return 0;
    };

    this.JSR = function () {
      return 0;
    };

    this.LDA = function () {
      // load to a
      _this.fetch();

      _this.a = _this.fetched;

      _this.SetFlag(Flags.Z, _this.fetched == 0x00);

      _this.SetFlag(Flags.N, (_this.fetched & 0x80) != 0);

      return 1;
    };

    this.LDX = function () {
      // load to x
      _this.fetch();

      _this.x = _this.fetched;

      _this.SetFlag(Flags.Z, _this.fetched == 0x00);

      _this.SetFlag(Flags.N, (_this.fetched & 0x80) != 0);

      return 1;
    };

    this.LDY = function () {
      // load to y
      _this.fetch();

      _this.y = _this.fetched;

      _this.SetFlag(Flags.Z, _this.fetched == 0x00);

      _this.SetFlag(Flags.N, (_this.fetched & 0x80) != 0);

      return 1;
    };

    this.LSR = function () {
      return 0;
    };

    this.NOP = function () {
      return 0;
    };

    this.ORA = function () {
      return 0;
    };

    this.PHA = function () {
      // push accumulator to stack
      _this.write(0x0100 + _this.sp, _this.a);

      _this.sp--;
      return 0;
    };

    this.PHP = function () {
      return 0;
    };

    this.PLA = function () {
      // pop stack to A
      _this.sp++;
      _this.a = _this.read(0x0100 + _this.sp);

      _this.SetFlag(Flags.Z, _this.a == 0x00);

      _this.SetFlag(Flags.N, (_this.a & 0x80) != 0);

      return 0;
    };

    this.PLP = function () {
      return 0;
    };

    this.ROL = function () {
      return 0;
    };

    this.ROR = function () {
      return 0;
    };

    this.RTI = function () {
      _this.sp++;
      _this.status = _this.read(0x0100 + _this.sp);
      _this.status &= ~Flags.B;
      _this.status &= ~Flags.U;
      _this.sp++;
      _this.pc = _this.read(0x100 + _this.sp);
      _this.sp++;
      _this.pc |= _this.read(0x100 + _this.sp) << 8;
      return 0;
    };

    this.RTS = function () {
      return 0;
    };

    this.SBC = function () {
      // subtraction
      _this.fetch();

      var value = _this.fetched ^ 0x00ff;
      var result = _this.a + value + (_this.GetFlag(Flags.C) ? 1 : 0);

      _this.SetFlag(Flags.C, (result & 0xff00) != 0); // set carry bit


      _this.SetFlag(Flags.Z, (result & 0x00ff) == 0); // set zero flag


      _this.SetFlag(Flags.N, (result & 0x0080) != 0); // negative flag


      _this.SetFlag(Flags.V, ((result ^ _this.a) & (result ^ value) & 0x0080) != 0); // set overflow flag


      _this.a = result & 0x00ff;
      return 1;
    };

    this.SEC = function () {
      return 0;
    };

    this.SED = function () {
      return 0;
    };

    this.SEI = function () {
      return 0;
    };

    this.STA = function () {
      // store accumulator
      _this.write(_this.addr_abs, _this.a);

      return 0;
    };

    this.STX = function () {
      // store x
      _this.write(_this.addr_abs, _this.x);

      return 0;
    };

    this.STY = function () {
      // store y
      _this.write(_this.addr_abs, _this.y);

      return 0;
    };

    this.TAX = function () {
      return 0;
    };

    this.TAY = function () {
      return 0;
    };

    this.TSX = function () {
      return 0;
    };

    this.TXA = function () {
      return 0;
    };

    this.TXS = function () {
      return 0;
    };

    this.TYA = function () {
      return 0;
    };

    this.XXX = function () {
      return 0;
    }; // lookup table
    // [FUNCTION, MODE, CYCLES]


    this.lookup = {
      0x00: [this.BRK, this.IMM, 7],
      0x01: [this.ORA, this.IZX, 6],
      0x02: [this.XXX, this.IMP, 2],
      0x03: [this.XXX, this.IMP, 8],
      0x04: [this.NOP, this.IMP, 3],
      0x05: [this.ORA, this.ZP0, 3],
      0x06: [this.ASL, this.ZP0, 5],
      0x07: [this.XXX, this.IMP, 5],
      0x08: [this.PHP, this.IMP, 3],
      0x09: [this.ORA, this.IMM, 2],
      0x0a: [this.ASL, this.IMP, 2],
      0x0b: [this.XXX, this.IMP, 2],
      0x0c: [this.NOP, this.IMP, 4],
      0x0d: [this.ORA, this.ABS, 4],
      0x0e: [this.ASL, this.ABS, 6],
      0x0f: [this.XXX, this.IMP, 6],
      0x10: [this.BPL, this.REL, 2],
      0x11: [this.ORA, this.IZY, 5],
      0x12: [this.XXX, this.IMP, 2],
      0x13: [this.XXX, this.IMP, 8],
      0x14: [this.NOP, this.IMP, 4],
      0x15: [this.ORA, this.ZPX, 4],
      0x16: [this.ASL, this.ZPX, 6],
      0x17: [this.XXX, this.IMP, 6],
      0x18: [this.CLC, this.IMP, 2],
      0x19: [this.ORA, this.ABY, 4],
      0x1a: [this.NOP, this.IMP, 2],
      0x1b: [this.XXX, this.IMP, 7],
      0x1c: [this.NOP, this.IMP, 4],
      0x1d: [this.ORA, this.ABX, 4],
      0x1e: [this.ASL, this.ABX, 7],
      0x1f: [this.XXX, this.IMP, 7],
      0x20: [this.JSR, this.ABS, 6],
      0x21: [this.AND, this.IZX, 6],
      0x22: [this.XXX, this.IMP, 2],
      0x23: [this.XXX, this.IMP, 8],
      0x24: [this.BIT, this.ZP0, 3],
      0x25: [this.AND, this.ZP0, 3],
      0x26: [this.ROL, this.ZP0, 5],
      0x27: [this.XXX, this.IMP, 5],
      0x28: [this.PLP, this.IMP, 4],
      0x29: [this.AND, this.IMM, 2],
      0x2a: [this.ROL, this.IMP, 2],
      0x2b: [this.XXX, this.IMP, 2],
      0x2c: [this.BIT, this.ABS, 4],
      0x2d: [this.AND, this.ABS, 4],
      0x2e: [this.ROL, this.ABS, 6],
      0x2f: [this.XXX, this.IMP, 6],
      0x30: [this.BMI, this.REL, 2],
      0x31: [this.AND, this.IZY, 5],
      0x32: [this.XXX, this.IMP, 2],
      0x33: [this.XXX, this.IMP, 8],
      0x34: [this.NOP, this.IMP, 4],
      0x35: [this.AND, this.ZPX, 4],
      0x36: [this.ROL, this.ZPX, 6],
      0x37: [this.XXX, this.IMP, 6],
      0x38: [this.SEC, this.IMP, 2],
      0x39: [this.AND, this.ABY, 4],
      0x3a: [this.NOP, this.IMP, 2],
      0x3b: [this.XXX, this.IMP, 7],
      0x3c: [this.NOP, this.IMP, 4],
      0x3d: [this.AND, this.ABX, 4],
      0x3e: [this.ROL, this.ABX, 7],
      0x3f: [this.XXX, this.IMP, 7],
      0x40: [this.RTI, this.IMP, 6],
      0x41: [this.EOR, this.IZX, 6],
      0x42: [this.XXX, this.IMP, 2],
      0x43: [this.XXX, this.IMP, 8],
      0x44: [this.NOP, this.IMP, 3],
      0x45: [this.EOR, this.ZP0, 3],
      0x46: [this.LSR, this.ZP0, 5],
      0x47: [this.XXX, this.IMP, 5],
      0x48: [this.PHA, this.IMP, 3],
      0x49: [this.EOR, this.IMM, 2],
      0x4a: [this.LSR, this.IMP, 2],
      0x4b: [this.XXX, this.IMP, 2],
      0x4c: [this.JMP, this.ABS, 3],
      0x4d: [this.EOR, this.ABS, 4],
      0x4e: [this.LSR, this.ABS, 6],
      0x4f: [this.XXX, this.IMP, 6],
      0x50: [this.BVC, this.REL, 2],
      0x51: [this.EOR, this.IZY, 5],
      0x52: [this.XXX, this.IMP, 2],
      0x53: [this.XXX, this.IMP, 8],
      0x54: [this.NOP, this.IMP, 4],
      0x55: [this.EOR, this.ZPX, 4],
      0x56: [this.LSR, this.ZPX, 6],
      0x57: [this.XXX, this.IMP, 6],
      0x58: [this.CLI, this.IMP, 2],
      0x59: [this.EOR, this.ABY, 4],
      0x5a: [this.NOP, this.IMP, 2],
      0x5b: [this.XXX, this.IMP, 7],
      0x5c: [this.NOP, this.IMP, 4],
      0x5d: [this.EOR, this.ABX, 4],
      0x5e: [this.LSR, this.ABX, 7],
      0x5f: [this.XXX, this.IMP, 7],
      0x60: [this.RTS, this.IMP, 6],
      0x61: [this.ADC, this.IZX, 6],
      0x62: [this.XXX, this.IMP, 2],
      0x63: [this.XXX, this.IMP, 8],
      0x64: [this.NOP, this.IMP, 3],
      0x65: [this.ADC, this.ZP0, 3],
      0x66: [this.ROR, this.ZP0, 5],
      0x67: [this.XXX, this.IMP, 5],
      0x68: [this.PLA, this.IMP, 4],
      0x69: [this.ADC, this.IMM, 2],
      0x6a: [this.ROR, this.IMP, 2],
      0x6b: [this.XXX, this.IMP, 2],
      0x6c: [this.JMP, this.IND, 5],
      0x6d: [this.ADC, this.ABS, 4],
      0x6e: [this.ROR, this.ABS, 6],
      0x6f: [this.XXX, this.IMP, 6],
      0x70: [this.BVS, this.REL, 2],
      0x71: [this.ADC, this.IZY, 5],
      0x72: [this.XXX, this.IMP, 2],
      0x73: [this.XXX, this.IMP, 8],
      0x74: [this.NOP, this.IMP, 4],
      0x75: [this.ADC, this.ZPX, 4],
      0x76: [this.ROR, this.ZPX, 6],
      0x77: [this.XXX, this.IMP, 6],
      0x78: [this.SEI, this.IMP, 2],
      0x79: [this.ADC, this.ABY, 4],
      0x7a: [this.NOP, this.IMP, 2],
      0x7b: [this.XXX, this.IMP, 7],
      0x7c: [this.NOP, this.IMP, 4],
      0x7d: [this.ADC, this.ABX, 4],
      0x7e: [this.ROR, this.ABX, 7],
      0x7f: [this.XXX, this.IMP, 7],
      0x80: [this.NOP, this.IMP, 2],
      0x81: [this.STA, this.IZX, 6],
      0x82: [this.NOP, this.IMP, 2],
      0x83: [this.XXX, this.IMP, 6],
      0x84: [this.STY, this.ZP0, 3],
      0x85: [this.STA, this.ZP0, 3],
      0x86: [this.STX, this.ZP0, 3],
      0x87: [this.XXX, this.IMP, 3],
      0x88: [this.DEY, this.IMP, 2],
      0x89: [this.NOP, this.IMP, 2],
      0x8a: [this.TXA, this.IMP, 2],
      0x8b: [this.XXX, this.IMP, 2],
      0x8c: [this.STY, this.ABS, 4],
      0x8d: [this.STA, this.ABS, 4],
      0x8e: [this.STX, this.ABS, 4],
      0x8f: [this.XXX, this.IMP, 4],
      0x90: [this.BCC, this.REL, 2],
      0x91: [this.STA, this.IZY, 6],
      0x92: [this.XXX, this.IMP, 2],
      0x93: [this.XXX, this.IMP, 6],
      0x94: [this.STY, this.ZPX, 4],
      0x95: [this.STA, this.ZPX, 4],
      0x96: [this.STX, this.ZPY, 4],
      0x97: [this.XXX, this.IMP, 4],
      0x98: [this.TYA, this.IMP, 2],
      0x99: [this.STA, this.ABY, 5],
      0x9a: [this.TXS, this.IMP, 2],
      0x9b: [this.XXX, this.IMP, 5],
      0x9c: [this.NOP, this.IMP, 5],
      0x9d: [this.STA, this.ABX, 5],
      0x9e: [this.XXX, this.IMP, 5],
      0x9f: [this.XXX, this.IMP, 5],
      0xa0: [this.LDY, this.IMM, 2],
      0xa1: [this.LDA, this.IZX, 6],
      0xa2: [this.LDX, this.IMM, 2],
      0xa3: [this.XXX, this.IMP, 6],
      0xa4: [this.LDY, this.ZP0, 3],
      0xa5: [this.LDA, this.ZP0, 3],
      0xa6: [this.LDX, this.ZP0, 3],
      0xa7: [this.XXX, this.IMP, 3],
      0xa8: [this.TAY, this.IMP, 2],
      0xa9: [this.LDA, this.IMM, 2],
      0xaa: [this.TAX, this.IMP, 2],
      0xab: [this.XXX, this.IMP, 2],
      0xac: [this.LDY, this.ABS, 4],
      0xad: [this.LDA, this.ABS, 4],
      0xae: [this.LDX, this.ABS, 4],
      0xaf: [this.XXX, this.IMP, 4],
      0xb0: [this.BCS, this.REL, 2],
      0xb1: [this.LDA, this.IZY, 5],
      0xb2: [this.XXX, this.IMP, 2],
      0xb3: [this.XXX, this.IMP, 5],
      0xb4: [this.LDY, this.ZPX, 4],
      0xb5: [this.LDA, this.ZPX, 4],
      0xb6: [this.LDX, this.ZPY, 4],
      0xb7: [this.XXX, this.IMP, 4],
      0xb8: [this.CLV, this.IMP, 2],
      0xb9: [this.LDA, this.ABY, 4],
      0xba: [this.TSX, this.IMP, 2],
      0xbb: [this.XXX, this.IMP, 4],
      0xbc: [this.LDY, this.ABX, 4],
      0xbd: [this.LDA, this.ABX, 4],
      0xbe: [this.LDX, this.ABY, 4],
      0xbf: [this.XXX, this.IMP, 4],
      0xc0: [this.CPY, this.IMM, 2],
      0xc1: [this.CMP, this.IZX, 6],
      0xc2: [this.NOP, this.IMP, 2],
      0xc3: [this.XXX, this.IMP, 8],
      0xc4: [this.CPY, this.ZP0, 3],
      0xc5: [this.CMP, this.ZP0, 3],
      0xc6: [this.DEC, this.ZP0, 5],
      0xc7: [this.XXX, this.IMP, 5],
      0xc8: [this.INY, this.IMP, 2],
      0xc9: [this.CMP, this.IMM, 2],
      0xca: [this.DEX, this.IMP, 2],
      0xcb: [this.XXX, this.IMP, 2],
      0xcc: [this.CPY, this.ABS, 4],
      0xcd: [this.CMP, this.ABS, 4],
      0xce: [this.DEC, this.ABS, 6],
      0xcf: [this.XXX, this.IMP, 6],
      0xd4: [this.NOP, this.IMP, 4],
      0xd1: [this.CMP, this.ZPX, 4],
      0xd2: [this.DEC, this.ZPX, 6],
      0xd3: [this.XXX, this.IMP, 6],
      0xd0: [this.BNE, this.REL, 2],
      0xd5: [this.CMP, this.IZY, 5],
      0xd6: [this.XXX, this.IMP, 2],
      0xd7: [this.XXX, this.IMP, 8],
      0xd8: [this.CLD, this.IMP, 2],
      0xd9: [this.CMP, this.ABY, 4],
      0xda: [this.NOP, this.IMP, 2],
      0xdb: [this.XXX, this.IMP, 7],
      0xdc: [this.NOP, this.IMP, 4],
      0xdd: [this.CMP, this.ABX, 4],
      0xde: [this.DEC, this.ABX, 7],
      0xdf: [this.XXX, this.IMP, 7],
      0xe0: [this.CPX, this.IMM, 2],
      0xe1: [this.SBC, this.IZX, 6],
      0xe2: [this.NOP, this.IMP, 2],
      0xe3: [this.XXX, this.IMP, 8],
      0xe4: [this.CPX, this.ZP0, 3],
      0xe5: [this.SBC, this.ZP0, 3],
      0xe6: [this.INC, this.ZP0, 5],
      0xe7: [this.XXX, this.IMP, 5],
      0xe8: [this.INX, this.IMP, 2],
      0xe9: [this.SBC, this.IMM, 2],
      0xea: [this.NOP, this.IMP, 2],
      0xeb: [this.SBC, this.IMP, 2],
      0xec: [this.CPX, this.ABS, 4],
      0xed: [this.SBC, this.ABS, 4],
      0xee: [this.INC, this.ABS, 6],
      0xef: [this.XXX, this.IMP, 6],
      0xf0: [this.BEQ, this.REL, 2],
      0xf1: [this.SBC, this.IZY, 5],
      0xf2: [this.XXX, this.IMP, 2],
      0xf3: [this.XXX, this.IMP, 8],
      0xf4: [this.NOP, this.IMP, 4],
      0xf5: [this.SBC, this.ZPX, 4],
      0xf6: [this.INC, this.ZPX, 6],
      0xf7: [this.XXX, this.IMP, 6],
      0xf8: [this.SED, this.IMP, 2],
      0xf9: [this.SBC, this.ABY, 4],
      0xfa: [this.NOP, this.IMP, 2],
      0xfb: [this.XXX, this.IMP, 7],
      0xfc: [this.NOP, this.IMP, 4],
      0xfd: [this.SBC, this.ABX, 4],
      0xfe: [this.INC, this.ABX, 7],
      0xff: [this.XXX, this.IMP, 7]
    };
  }

  CPU6502.prototype.GetFlag = function (flagName) {
    switch (flagName) {
      case Flags.B:
        return this.flags.B;

      case Flags.C:
        return this.flags.C;

      case Flags.D:
        return this.flags.D;

      case Flags.I:
        return this.flags.I;

      case Flags.N:
        return this.flags.N;

      case Flags.U:
        return this.flags.U;

      case Flags.V:
        return this.flags.V;

      case Flags.Z:
        return this.flags.Z;
    }
  };

  CPU6502.prototype.SetFlag = function (flag, state) {
    switch (flag) {
      case Flags.B:
        {
          this.flags.B = state;
          break;
        }

      case Flags.C:
        {
          this.flags.C = state;
          break;
        }

      case Flags.D:
        {
          this.flags.D = state;
          break;
        }

      case Flags.I:
        {
          this.flags.I = state;
          break;
        }

      case Flags.N:
        {
          this.flags.N = state;
          break;
        }

      case Flags.U:
        {
          this.flags.U = state;
          break;
        }

      case Flags.V:
        {
          this.flags.V = state;
          break;
        }

      case Flags.Z:
        {
          this.flags.Z = state;
          break;
        }
    }
  };

  CPU6502.prototype.loadProgram = function (base, program) {
    for (var bitIndex = 0; bitIndex < program.length; bitIndex++) {
      this.write(base + bitIndex, program[bitIndex]);
    }

    this.pc = base;
  };

  CPU6502.prototype.step = function () {
    this.cycle();

    while (this.cycles != 0) {
      this.cycle();
    }
  };

  CPU6502.prototype.write = function (adress, data) {
    if (this.bus != undefined) {
      this.bus.cpuWrite(adress, data);
    }
  };

  CPU6502.prototype.read = function (adress, readOnly) {
    if (readOnly === void 0) {
      readOnly = false;
    }

    return this.bus != undefined ? this.bus.cpuRead(adress, readOnly) : 0x00;
  };

  return CPU6502;
}();

exports.CPU6502 = CPU6502;
},{}],"PPU.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var PPU =
/** @class */
function () {
  function PPU() {
    this.tNameSpaces = [new Uint8Array(1024), new Uint8Array(1024)];
    this.tPalette = [new Uint8Array(32)];
    this.tPattern = [new Uint8Array(4096), new Uint8Array(4096)]; // normally in cartridge
  }

  PPU.prototype.cpuWrite = function (adress, data) {
    switch (adress) {
      case 0:
        {
          break;
        }

      case 1:
        {
          break;
        }

      case 2:
        {
          break;
        }

      case 3:
        {
          break;
        }

      case 4:
        {
          break;
        }

      case 5:
        {
          break;
        }

      case 6:
        {
          break;
        }

      case 7:
        {
          break;
        }
    }
  };

  PPU.prototype.cpuRead = function (adress, readOnly) {
    if (readOnly === void 0) {
      readOnly = false;
    }

    var data = 0x00;

    switch (adress) {
      case 0:
        {
          break;
        }

      case 1:
        {
          break;
        }

      case 2:
        {
          break;
        }

      case 3:
        {
          break;
        }

      case 4:
        {
          break;
        }

      case 5:
        {
          break;
        }

      case 6:
        {
          break;
        }

      case 7:
        {
          break;
        }
    }

    return data;
  };

  PPU.prototype.ppuWrite = function (adress, data) {
    adress &= 0x3fff;

    if (this.cart != undefined && this.cart.ppuWrite(adress, data)) {}
  };

  PPU.prototype.ppuRead = function (adress, readOnly) {
    if (readOnly === void 0) {
      readOnly = false;
    }

    var data = 0x00;
    adress &= 0x3fff;

    if (this.cart != undefined && this.cart.ppuRead(adress, data)) {}

    return data;
  };

  PPU.prototype.connectCartridge = function (cart) {
    this.cart = cart;
  };

  PPU.prototype.clock = function () {};

  return PPU;
}();

exports.PPU = PPU;
},{}],"bus.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var _6502_1 = require("./6502");

var PPU_1 = require("./PPU");

var Bus =
/** @class */
function () {
  function Bus() {
    // devices
    this.cpu = new _6502_1.CPU6502();
    this.cpuRAM = new Uint8Array(2048);
    this.ppu = new PPU_1.PPU();
    this.systemClockCounter = 0;
    this.cpu.bus = this;
  }

  Bus.prototype.cpuWrite = function (adress, data) {
    if (this.cart != undefined && this.cart.cpuWrite(adress, data)) {} else if (adress >= 0x00000 && adress <= 0x1fff) {
      this.cpuRAM[adress & 0x07ff] = data;
    } else if (adress >= 0x2000 && adress <= 0x3fff) {
      this.ppu.cpuWrite(adress & 0x0007, data);
    }
  };

  Bus.prototype.cpuRead = function (adress, readOnly) {
    if (this.cart != undefined && this.cart.cpuRead(adress)) {}

    if (adress >= 0x0000 && adress <= 0x1fff) {
      return this.cpuRAM[adress & 0x07ff];
    } else if (adress >= 0x2000 && adress <= 0x3fff) {
      return this.ppu.cpuRead(adress & 0x0007);
    }

    return 0x0;
  };

  Bus.prototype.insertCartridge = function (cart) {
    this.cart = cart;
    this.ppu.connectCartridge(cart);
  };

  Bus.prototype.reset = function () {
    this.cpu.reset();
    this.systemClockCounter = 0;
  };

  Bus.prototype.clock = function () {};

  return Bus;
}();

exports.Bus = Bus;
},{"./6502":"6502.ts","./PPU":"PPU.ts"}],"tools/openFile.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

function openFile() {
  return new Promise(function (resolve) {
    var input = document.createElement("input");
    input.style.display = "none";

    if (input != null) {
      input.type = "file";

      input.onchange = function (_) {
        if (input.files != null) {
          var files = Array.from(input.files);
          resolve(files[0]);
        }
      };

      input.click();
    }
  });
}

exports.openFile = openFile;
},{}],"mapper.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var Mapper =
/** @class */
function () {
  function Mapper(prgBanks, chrBanks) {
    this.prgBanks = 0;
    this.chrBanks = 0;
    this.prgBanks = prgBanks;
    this.chrBanks = chrBanks;
  }

  Mapper.prototype.cpuMapRead = function (addres, mapped_address) {
    return false;
  };

  Mapper.prototype.cpuMapWrite = function (addres, mapped_address) {
    return false;
  };

  Mapper.prototype.ppuMapRead = function (addres, mapped_address) {
    return false;
  };

  Mapper.prototype.ppuMapWrite = function (addres, mapped_address) {
    return false;
  };

  return Mapper;
}();

exports.Mapper = Mapper;
},{}],"mappers/mapper000.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) {
      if (b.hasOwnProperty(p)) d[p] = b[p];
    }
  };

  return function (d, b) {
    extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

exports.__esModule = true;

var mapper_1 = require("../mapper");

var Mapper000 =
/** @class */
function (_super) {
  __extends(Mapper000, _super);

  function Mapper000() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  Mapper000.prototype.cpuMapRead = function (addres, mapped_address) {
    if (addres >= 0x8000 && addres <= 0xFFFF) {
      mapped_address.value = addres & (this.prgBanks > 1 ? 0x7FFF : 0x3FFF); // 32 or 64k ROM

      return true;
    }

    return false;
  };

  Mapper000.prototype.cpuMapWrite = function (addres, mapped_address) {
    if (addres >= 0x8000 && addres <= 0xFFFF) {
      mapped_address.value = addres & (this.prgBanks > 1 ? 0x7FFF : 0x3FFF); // 32 or 64k ROM

      return true;
    }

    return false;
  };

  Mapper000.prototype.ppuMapRead = function (addres, mapped_address) {
    if (addres >= 0x0000 && addres <= 0x1FFF) {
      mapped_address.value = addres;
      return true;
    }

    return false;
  };

  Mapper000.prototype.ppuMapWrite = function (addres, mapped_address) {
    return false;
  };

  return Mapper000;
}(mapper_1.Mapper);

exports.Mapper000 = Mapper000;
},{"../mapper":"mapper.ts"}],"cartridge.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var openFile_1 = require("./tools/openFile");

var mapper000_1 = require("./mappers/mapper000");

var Cardridge =
/** @class */
function () {
  function Cardridge() {
    var _this = this;

    this.mapperID = 0;
    this.PRGBanks = 0;
    this.CHRBanks = 0;
    var content = openFile_1.openFile();
    content.then(function (content) {
      content.text().then(function (text) {
        var LoadedHeader = {
          name: text.substring(0, 4),
          prg_chunks: text.charCodeAt(4),
          chr_chunks: text.charCodeAt(5),
          mapper1: text.charCodeAt(6),
          mapper2: text.charCodeAt(7),
          prg_ram_size: text.charCodeAt(8),
          tv_system1: text.charCodeAt(9),
          tv_system2: text.charCodeAt(10),
          unused: text.substr(11, 4).split("").map(function (v) {
            return v.charCodeAt(0);
          })
        };
        _this.mapperID = LoadedHeader.mapper2 >> 4 << 4 | LoadedHeader.mapper1 >> 4;
        var filetype = 1;

        switch (filetype) {
          case 0:
            {
              break;
            }

          case 1:
            {
              // load program data
              _this.PRGBanks = LoadedHeader.prg_chunks;
              _this.PRGMemory = new Uint8Array(_this.PRGBanks * 16384);

              for (var i = 0; i < _this.PRGMemory.length; i++) {
                _this.PRGMemory[i] = text.charCodeAt(i + 526);
              }

              _this.CHRBanks = LoadedHeader.chr_chunks;
              _this.CHRMemory = new Uint8Array(_this.CHRBanks * 8192);

              for (var i = 0; i < _this.CHRMemory.length; i++) {
                _this.CHRMemory[i] = text.charCodeAt(i + 526 + _this.PRGMemory.length);
              }

              break;
            }

          case 2:
            {
              break;
            }
        }

        switch (_this.mapperID) {
          case 0:
            _this.mapper = new mapper000_1.Mapper000(_this.PRGBanks, _this.CHRBanks);
        }

        console.log(_this.PRGMemory);
        console.log(_this.CHRMemory);
      });
    });
  }

  Cardridge.prototype.cpuWrite = function (adress, data) {};

  Cardridge.prototype.cpuRead = function (adress, data) {};

  Cardridge.prototype.ppuWrite = function (adress, data) {};

  Cardridge.prototype.ppuRead = function (adress, data) {};

  return Cardridge;
}();

exports.Cardridge = Cardridge;
},{"./tools/openFile":"tools/openFile.ts","./mappers/mapper000":"mappers/mapper000.ts"}],"main.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var bus_1 = require("./bus");

var cartridge_1 = require("./cartridge");

var b = new bus_1.Bus();
console.log(b);
var romload = document.getElementById("romload");

if (romload != null) {
  romload.onclick = function () {
    b.insertCartridge(new cartridge_1.Cardridge());
  };
} // const cpu = new CPU6502();
// /*
//     *=$8000
//     LDX #10
//     STX $0000
//     LDX #3
//     STX $0001
//     LDY $0000
//     LDA #0
//     CLC
//     loop
//     ADC $0001
//     DEY
//     DNE loop
//     STA $0002
//     NOP
//     NOP
//     NOP
// */
// const program = [
//   //1:00:16
//   0xa2, // store 0x0a to register A
//   0x0a,
//   0x8e, // store register A to 0x0000
//   0x00,
//   0x00,
//   0xa2, // store 0x03 in register A
//   0x03,
//   0x8e, // store register A to 0x0001
//   0x01,
//   0x00,
//   0xac, // store 0x0000 to acc
//   0x00,
//   0x00,
//   0xa9, // load 00 into acc
//   0x00,
//   0x18, // clear carry
//   0x6d, // add bit at 0001 to acc
//   0x01,
//   0x00,
//   0x88,
//   0xd0, // branch back
//   0xfa, //
//   0x8d,
//   0x02,
//   0x00,
//   0xea,
//   0xea,
//   0xea,
// ];
// cpu.loadProgram(0x8000, program);
// let view = document.getElementById("view");
// let viewBar = document.getElementById("viewbar");
// let viewTitle = document.getElementById("viewtitle");
// let currentPage = "80";
// let running = false;
// const updateTitle = () => {
//   if (viewTitle != null) {
//     const newTitle = fillInHex(currentPage, 2);
//     viewTitle.innerHTML = `<h1><b>View on page 0x${newTitle}:</h1></b>`;
//   }
// };
// updateTitle();
// if (viewBar != null) {
//   viewBar.innerHTML = `
//   <button id="back10"><<</button>
//   <button id="back1"><</button>
//   <button id="next1">></button>
//   <button id="next10">>></button>
//   <button id="step">step</button>
//   <button id="run">run</button>
//   <button id="stop">stop</button>`;
// }
// const setFlagColor = (el: HTMLElement | null, active: boolean) => {
//   if (el != null) {
//     if (active) {
//       el.classList.remove("red");
//       el.classList.add("green");
//     } else {
//       el.classList.remove("green");
//       el.classList.add("red");
//     }
//   }
// };
// const updateRegisters = () => {
//   const a = document.getElementById("regA");
//   const x = document.getElementById("regX");
//   const y = document.getElementById("regY");
//   if (a != null && x != null && y != null) {
//     x.innerHTML = "X = 0x" + fillInHex(cpu.x.toString(16), 2);
//     y.innerHTML = "Y = 0x" + fillInHex(cpu.y.toString(16), 2);
//     a.innerHTML = "A = 0x" + fillInHex(cpu.a.toString(16), 2);
//   }
// };
// updateRegisters();
// const updateFlags = () => {
//   const f1 = document.getElementById("cary");
//   const f2 = document.getElementById("zero");
//   const f3 = document.getElementById("interupts");
//   const f4 = document.getElementById("decimal");
//   const f5 = document.getElementById("break");
//   const f6 = document.getElementById("unused");
//   const f7 = document.getElementById("overflow");
//   const f8 = document.getElementById("negative");
//   setFlagColor(f1, cpu.GetFlag(0));
//   setFlagColor(f2, cpu.GetFlag(1));
//   setFlagColor(f3, cpu.GetFlag(2));
//   setFlagColor(f4, cpu.GetFlag(3));
//   setFlagColor(f5, cpu.GetFlag(4));
//   setFlagColor(f6, cpu.GetFlag(5));
//   setFlagColor(f7, cpu.GetFlag(6));
//   setFlagColor(f8, cpu.GetFlag(7));
// };
// updateFlags();
// const changePage = (delta: number) => {
//   let n = parseInt(currentPage, 16) + delta;
//   if (n < 0) {
//     n = 0x00;
//   }
//   if (n > 0xff) {
//     n = 0xff;
//   }
//   currentPage = n.toString(16);
//   renderPage();
//   updateTitle();
// };
// const renderPage = () => {
//   if (view != null) {
//     view.innerHTML =
//       "<h2>" + printPage(cpu, parseInt(currentPage, 16)) + "</h2>";
//   }
// };
// renderPage();
// let step = document.getElementById("step");
// if (step != null) {
//   step.onclick = () => {
//     cpu.step();
//     updateFlags();
//     renderPage();
//     updateRegisters();
//   };
// }
// let b1 = document.getElementById("back10");
// if (b1 != null) {
//   b1.onclick = () => {
//     changePage(-16);
//   };
// }
// let b2 = document.getElementById("back1");
// if (b2 != null) {
//   b2.onclick = () => {
//     changePage(-1);
//   };
// }
// let b3 = document.getElementById("next10");
// if (b3 != null) {
//   b3.onclick = () => {
//     changePage(16);
//   };
// }
// let b4 = document.getElementById("next1");
// if (b4 != null) {
//   b4.onclick = () => {
//     changePage(1);
//   };
// }
// const autoRun = () => {
//   cpu.step();
//   updateFlags();
//   renderPage();
//   updateRegisters();
//   if (running) {
//     window.requestAnimationFrame(autoRun);
//   }
// };
// let brun = document.getElementById("run");
// if (brun != null) {
//   brun.onclick = () => {
//     running = true;
//     autoRun();
//   };
// }
// let bstop = document.getElementById("stop");
// if (bstop != null) {
//   bstop.onclick = () => {
//     running = false;
//   };
// }
},{"./bus":"bus.ts","./cartridge":"cartridge.ts"}],"C:/Users/lucde/AppData/Roaming/npm/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "51373" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/lucde/AppData/Roaming/npm/node_modules/parcel/src/builtins/hmr-runtime.js","main.ts"], null)
//# sourceMappingURL=/main.js.map