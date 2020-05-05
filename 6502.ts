import { Bus } from "./bus";
import O from "./opcodes";

enum Flags {
  C, // carry
  Z, // zero
  I, // disable interupts
  D, // decimal mode
  B, // break
  U, // unused
  V, // overflow
  N, // negative
}

interface Instruction {
  name: string;
  cycles: number;
  mode: () => void;
  function: () => number;
}

export class CPU6502 {
  bus: Bus = undefined;

  fetched = 0;
  addr_rel = 0;
  addr_abs = 0;
  opcode = 0;
  cycles = 0;

  // registers
  status = 0;
  pc = 0;
  sc = 0;
  a = 0;
  x = 0;
  y = 0;

  // adressing modes
  IMP() {
    // implied
    this.fetched = this.a;
    return 0;
  }

  IMM() {
    // immediate
    this.addr_abs = this.pc;
    this.pc++;
    return 0;
  }

  ZP0() {
    // zero page
    this.addr_abs = this.read(this.pc) & 0x00ff;
    this.pc++;
    return 0;
  }

  ZPX() {
    // zero page with offset from X register
    this.addr_abs = this.read(this.pc + this.x) & 0x00ff;
    this.pc++;
    return 0;
  }

  ZPY() {
    // zero page with offset from Y register
    this.addr_abs = this.read(this.pc + this.y) & 0x00ff;
    this.pc++;
    return 0;
  }

  REL() {}

  ABS() {
    // absolute
    const low = this.read(this.pc);
    this.pc++;
    const high = this.read(this.pc);
    this.pc++;

    this.addr_abs = (high << 8) | low;
    return 0;
  }

  ABX() {
    // absolute with offset from X register
    const low = this.read(this.pc);
    this.pc++;
    const high = this.read(this.pc);
    this.pc++;

    this.addr_abs = ((high << 8) | low) + this.x;

    if ((this.addr_abs & 0xff00) != high << 8) {
      return 1;
    }
    return 0;
  }

  ABY() {
    // absolute with offset from Y register
    const low = this.read(this.pc);
    this.pc++;
    const high = this.read(this.pc);
    this.pc++;

    this.addr_abs = ((high << 8) | low) + this.y;
    if ((this.addr_abs & 0xff00) != high << 8) {
      return 1;
    }
    return 0;
  }

  IND() {}
  IZX() {}
  IZY() {}

  cycle() {
    if (this.cycles === 0) {
      this.opcode = this.read(this.pc);
      this.pc++;
      this.cycles = this.lookup[this.opcode][2]; // set needed cycle count
      const extraCycles1: number = this.lookup[this.opcode][1](); // setup address mode
      const extraCycles2: number = this.lookup[this.opcode][0](); // execute instuction

      this.cycles += extraCycles1 & extraCycles2;
    }
    this.cycles--;
  }
  reset() {}
  requestInterupt() {}
  nonMascableInterupt() {}
  fetch() {}

  // lookup table
  // [FUNCTION, MODE, CYCLES]
  lookup = {
    0x00: [O.BRK, this.IMM, 7],
    0x01: [O.ORA, this.IZX, 6],
    0x02: [O.XXX, this.IMP, 2],
    0x03: [O.XXX, this.IMP, 8],
    0x04: [O.NOP, this.IMP, 3],
    0x05: [O.ORA, this.ZP0, 3],
    0x06: [O.ASL, this.ZP0, 5],
    0x07: [O.XXX, this.IMP, 5],
    0x08: [O.PHP, this.IMP, 3],
    0x09: [O.ORA, this.IMM, 2],
    0x0a: [O.ASL, this.IMP, 2],
    0x0b: [O.XXX, this.IMP, 2],
    0x0c: [O.NOP, this.IMP, 4],
    0x0d: [O.ORA, this.ABS, 4],
    0x0e: [O.ASL, this.ABS, 6],
    0x0f: [O.XXX, this.IMP, 6],
    0x10: [O.BPL, this.REL, 2],
    0x11: [O.ORA, this.IZY, 5],
    0x12: [O.XXX, this.IMP, 2],
    0x13: [O.XXX, this.IMP, 8],
    0x14: [O.NOP, this.IMP, 4],
    0x15: [O.ORA, this.ZPX, 4],
    0x16: [O.ASL, this.ZPX, 6],
    0x17: [O.XXX, this.IMP, 6],
    0x18: [O.CLC, this.IMP, 2],
    0x19: [O.ORA, this.ABY, 4],
    0x1a: [O.NOP, this.IMP, 2],
    0x1b: [O.XXX, this.IMP, 7],
    0x1c: [O.NOP, this.IMP, 4],
    0x1d: [O.ORA, this.ABX, 4],
    0x1e: [O.ASL, this.ABX, 7],
    0x1f: [O.XXX, this.IMP, 7],
    0x20: [O.JSR, this.ABS, 6],
    0x21: [O.AND, this.IZX, 6],
    0x22: [O.XXX, this.IMP, 2],
    0x23: [O.XXX, this.IMP, 8],
    0x24: [O.BIT, this.ZP0, 3],
    0x25: [O.AND, this.ZP0, 3],
    0x26: [O.ROL, this.ZP0, 5],
    0x27: [O.XXX, this.IMP, 5],
    0x28: [O.PLP, this.IMP, 4],
    0x29: [O.AND, this.IMM, 2],
    0x2a: [O.ROL, this.IMP, 2],
    0x2b: [O.XXX, this.IMP, 2],
    0x2c: [O.BIT, this.ABS, 4],
    0x2d: [O.AND, this.ABS, 4],
    0x2e: [O.ROL, this.ABS, 6],
    0x2f: [O.XXX, this.IMP, 6],
    0x30: [O.BMI, this.REL, 2],
    0x31: [O.AND, this.IZY, 5],
    0x32: [O.XXX, this.IMP, 2],
    0x33: [O.XXX, this.IMP, 8],
    0x34: [O.NOP, this.IMP, 4],
    0x35: [O.AND, this.ZPX, 4],
    0x36: [O.ROL, this.ZPX, 6],
    0x37: [O.XXX, this.IMP, 6],
    0x38: [O.SEC, this.IMP, 2],
    0x39: [O.AND, this.ABY, 4],
    0x3a: [O.NOP, this.IMP, 2],
    0x3b: [O.XXX, this.IMP, 7],
    0x3c: [O.NOP, this.IMP, 4],
    0x3d: [O.AND, this.ABX, 4],
    0x3e: [O.ROL, this.ABX, 7],
    0x3f: [O.XXX, this.IMP, 7],
    0x40: [O.RTI, this.IMP, 6],
    0x41: [O.EOR, this.IZX, 6],
    0x42: [O.XXX, this.IMP, 2],
    0x43: [O.XXX, this.IMP, 8],
    0x44: [O.NOP, this.IMP, 3],
    0x45: [O.EOR, this.ZP0, 3],
    0x46: [O.LSR, this.ZP0, 5],
    0x47: [O.XXX, this.IMP, 5],
    0x48: [O.PHA, this.IMP, 3],
    0x49: [O.EOR, this.IMM, 2],
    0x4a: [O.LSR, this.IMP, 2],
    0x4b: [O.XXX, this.IMP, 2],
    0x4c: [O.JMP, this.ABS, 3],
    0x4d: [O.EOR, this.ABS, 4],
    0x4e: [O.LSR, this.ABS, 6],
    0x4f: [O.XXX, this.IMP, 6],
    0x50: [O.BVC, this.REL, 2],
    0x51: [O.EOR, this.IZY, 5],
    0x52: [O.XXX, this.IMP, 2],
    0x53: [O.XXX, this.IMP, 8],
    0x54: [O.NOP, this.IMP, 4],
    0x55: [O.EOR, this.ZPX, 4],
    0x56: [O.LSR, this.ZPX, 6],
    0x57: [O.XXX, this.IMP, 6],
    0x58: [O.CLI, this.IMP, 2],
    0x59: [O.EOR, this.ABY, 4],
    0x5a: [O.NOP, this.IMP, 2],
    0x5b: [O.XXX, this.IMP, 7],
    0x5c: [O.NOP, this.IMP, 4],
    0x5d: [O.EOR, this.ABX, 4],
    0x5e: [O.LSR, this.ABX, 7],
    0x5f: [O.XXX, this.IMP, 7],
    0x60: [O.RTS, this.IMP, 6],
    0x61: [O.ADC, this.IZX, 6],
    0x62: [O.XXX, this.IMP, 2],
    0x63: [O.XXX, this.IMP, 8],
    0x64: [O.NOP, this.IMP, 3],
    0x65: [O.ADC, this.ZP0, 3],
    0x66: [O.ROR, this.ZP0, 5],
    0x67: [O.XXX, this.IMP, 5],
    0x68: [O.PLA, this.IMP, 4],
    0x69: [O.ADC, this.IMM, 2],
    0x6a: [O.ROR, this.IMP, 2],
    0x6b: [O.XXX, this.IMP, 2],
    0x6c: [O.JMP, this.IND, 5],
    0x6d: [O.ADC, this.ABS, 4],
    0x6e: [O.ROR, this.ABS, 6],
    0x6f: [O.XXX, this.IMP, 6],
    0x70: [O.BVS, this.REL, 2],
    0x71: [O.ADC, this.IZY, 5],
    0x72: [O.XXX, this.IMP, 2],
    0x73: [O.XXX, this.IMP, 8],
    0x74: [O.NOP, this.IMP, 4],
    0x75: [O.ADC, this.ZPX, 4],
    0x76: [O.ROR, this.ZPX, 6],
    0x77: [O.XXX, this.IMP, 6],
    0x78: [O.SEI, this.IMP, 2],
    0x79: [O.ADC, this.ABY, 4],
    0x7a: [O.NOP, this.IMP, 2],
    0x7b: [O.XXX, this.IMP, 7],
    0x7c: [O.NOP, this.IMP, 4],
    0x7d: [O.ADC, this.ABX, 4],
    0x7e: [O.ROR, this.ABX, 7],
    0x7f: [O.XXX, this.IMP, 7],
    0x80: [O.NOP, this.IMP, 2],
    0x81: [O.STA, this.IZX, 6],
    0x82: [O.NOP, this.IMP, 2],
    0x83: [O.XXX, this.IMP, 6],
    0x84: [O.STY, this.ZP0, 3],
    0x85: [O.STA, this.ZP0, 3],
    0x86: [O.STX, this.ZP0, 3],
    0x87: [O.XXX, this.IMP, 3],
    0x88: [O.DEY, this.IMP, 2],
    0x89: [O.NOP, this.IMP, 2],
    0x8a: [O.TXA, this.IMP, 2],
    0x8b: [O.XXX, this.IMP, 2],
    0x8c: [O.STY, this.ABS, 4],
    0x8d: [O.STA, this.ABS, 4],
    0x8e: [O.STX, this.ABS, 4],
    0x8f: [O.XXX, this.IMP, 4],
    0x90: [O.BCC, this.REL, 2],
    0x91: [O.STA, this.IZY, 6],
    0x92: [O.XXX, this.IMP, 2],
    0x93: [O.XXX, this.IMP, 6],
    0x94: [O.STY, this.ZPX, 4],
    0x95: [O.STA, this.ZPX, 4],
    0x96: [O.STX, this.ZPY, 4],
    0x97: [O.XXX, this.IMP, 4],
    0x98: [O.TYA, this.IMP, 2],
    0x99: [O.STA, this.ABY, 5],
    0x9a: [O.TXS, this.IMP, 2],
    0x9b: [O.XXX, this.IMP, 5],
    0x9c: [O.NOP, this.IMP, 5],
    0x9d: [O.STA, this.ABX, 5],
    0x9e: [O.XXX, this.IMP, 5],
    0x9f: [O.XXX, this.IMP, 5],
    0xa0: [O.LDY, this.IMM, 2],
    0xa1: [O.LDA, this.IZX, 6],
    0xa2: [O.LDX, this.IMM, 2],
    0xa3: [O.XXX, this.IMP, 6],
    0xa4: [O.LDY, this.ZP0, 3],
    0xa5: [O.LDA, this.ZP0, 3],
    0xa6: [O.LDX, this.ZP0, 3],
    0xa7: [O.XXX, this.IMP, 3],
    0xa8: [O.TAY, this.IMP, 2],
    0xa9: [O.LDA, this.IMM, 2],
    0xaa: [O.TAX, this.IMP, 2],
    0xab: [O.XXX, this.IMP, 2],
    0xac: [O.LDY, this.ABS, 4],
    0xad: [O.LDA, this.ABS, 4],
    0xae: [O.LDX, this.ABS, 4],
    0xaf: [O.XXX, this.IMP, 4],
    0xb0: [O.BCS, this.REL, 2],
    0xb1: [O.LDA, this.IZY, 5],
    0xb2: [O.XXX, this.IMP, 2],
    0xb3: [O.XXX, this.IMP, 5],
    0xb4: [O.LDY, this.ZPX, 4],
    0xb5: [O.LDA, this.ZPX, 4],
    0xb6: [O.LDX, this.ZPY, 4],
    0xb7: [O.XXX, this.IMP, 4],
    0xb8: [O.CLV, this.IMP, 2],
    0xb9: [O.LDA, this.ABY, 4],
    0xba: [O.TSX, this.IMP, 2],
    0xbb: [O.XXX, this.IMP, 4],
    0xbc: [O.LDY, this.ABX, 4],
    0xbd: [O.LDA, this.ABX, 4],
    0xbe: [O.LDX, this.ABY, 4],
    0xbf: [O.XXX, this.IMP, 4],
    0xc0: [O.CPY, this.IMM, 2],
    0xc1: [O.CMP, this.IZX, 6],
    0xc2: [O.NOP, this.IMP, 2],
    0xc3: [O.XXX, this.IMP, 8],
    0xc4: [O.CPY, this.ZP0, 3],
    0xc5: [O.CMP, this.ZP0, 3],
    0xc6: [O.DEC, this.ZP0, 5],
    0xc7: [O.XXX, this.IMP, 5],
    0xc8: [O.INY, this.IMP, 2],
    0xc9: [O.CMP, this.IMM, 2],
    0xca: [O.DEX, this.IMP, 2],
    0xcb: [O.XXX, this.IMP, 2],
    0xcc: [O.CPY, this.ABS, 4],
    0xcd: [O.CMP, this.ABS, 4],
    0xce: [O.DEC, this.ABS, 6],
    0xcf: [O.XXX, this.IMP, 6],
    0xd4: [O.NOP, this.IMP, 4],
    0xd1: [O.CMP, this.ZPX, 4],
    0xd2: [O.DEC, this.ZPX, 6],
    0xd3: [O.XXX, this.IMP, 6],
    0xd0: [O.BNE, this.REL, 2],
    0xd5: [O.CMP, this.IZY, 5],
    0xd6: [O.XXX, this.IMP, 2],
    0xd7: [O.XXX, this.IMP, 8],
    0xd8: [O.CLD, this.IMP, 2],
    0xd9: [O.CMP, this.ABY, 4],
    0xda: [O.NOP, this.IMP, 2],
    0xdb: [O.XXX, this.IMP, 7],
    0xdc: [O.NOP, this.IMP, 4],
    0xdd: [O.CMP, this.ABX, 4],
    0xde: [O.DEC, this.ABX, 7],
    0xdf: [O.XXX, this.IMP, 7],
    0xe0: [O.CPX, this.IMM, 2],
    0xe1: [O.SBC, this.IZX, 6],
    0xe2: [O.NOP, this.IMP, 2],
    0xe3: [O.XXX, this.IMP, 8],
    0xe4: [O.CPX, this.ZP0, 3],
    0xe5: [O.SBC, this.ZP0, 3],
    0xe6: [O.INC, this.ZP0, 5],
    0xe7: [O.XXX, this.IMP, 5],
    0xe8: [O.INX, this.IMP, 2],
    0xe9: [O.SBC, this.IMM, 2],
    0xea: [O.NOP, this.IMP, 2],
    0xeb: [O.SBC, this.IMP, 2],
    0xec: [O.CPX, this.ABS, 4],
    0xed: [O.SBC, this.ABS, 4],
    0xee: [O.INC, this.ABS, 6],
    0xef: [O.XXX, this.IMP, 6],
    0xf0: [O.BEQ, this.REL, 2],
    0xf1: [O.SBC, this.IZY, 5],
    0xf2: [O.XXX, this.IMP, 2],
    0xf3: [O.XXX, this.IMP, 8],
    0xf4: [O.NOP, this.IMP, 4],
    0xf5: [O.SBC, this.ZPX, 4],
    0xf6: [O.INC, this.ZPX, 6],
    0xf7: [O.XXX, this.IMP, 6],
    0xf8: [O.SED, this.IMP, 2],
    0xf9: [O.SBC, this.ABY, 4],
    0xfa: [O.NOP, this.IMP, 2],
    0xfb: [O.XXX, this.IMP, 7],
    0xfc: [O.NOP, this.IMP, 4],
    0xfd: [O.SBC, this.ABX, 4],
    0xfe: [O.INC, this.ABX, 7],
    0xff: [O.XXX, this.IMP, 7],
  };

  // public methods
  connectBus(bus: Bus) {
    this.bus = bus;
  }

  GetFlag() {}

  SetFlag() {}

  write(adress: number, data: number) {
    this.bus.write(adress, data);
  }

  read(adress: number, readOnly: boolean = false) {
    return this.bus.read(adress, readOnly);
  }
}
