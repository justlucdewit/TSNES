import { Bus } from "./bus";

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
  status = {
    C: false,
    Z: false,
    I: false,
    D: false,
    B: false,
    U: false,
    V: false,
    N: false,
  };
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

  REL() {
    // relative
    this.addr_rel = this.read(this.pc);
    this.pc++;
    if (this.addr_rel & 0x80) {
      this.addr_rel |= 0xff00;
    }
    return 0;
  }

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

  IND() {
    // indirect
    const ptr_low = this.read(this.pc);
    this.pc++;
    const ptr_high = this.read(this.pc);
    this.pc++;

    const ptr = (ptr_high << 8) | ptr_low;

    if (ptr_low === 0x00ff) {
      // page boundary hard ware bug
      this.addr_abs = this.read(ptr << 8) | this.read(ptr + 1);
    } else {
      this.addr_abs = this.read((ptr + 1) << 8) | this.read(ptr + 1);
    }

    return 0;
  }

  IZX() {
    // indirect zeropage offset from X
    const t = this.read(this.pc);
    this.pc++;

    const low = this.read(t & 0x00ff);
    const high = this.read((t + 1) & 0x00ff);

    this.addr_abs = ((high << 8) | low) + this.x;

    if ((this.addr_abs & 0xff00) != high << 8) {
      return 1;
    } else {
      return 0;
    }
  }

  IZY() {
    // indirect zeropage offset from Y
    const t = this.read(this.pc);
    this.pc++;

    const low = this.read(t & 0x00ff);
    const high = this.read((t + 1) & 0x00ff);

    this.addr_abs = ((high << 8) | low) + this.y;

    if ((this.addr_abs & 0xff00) != high << 8) {
      return 1;
    } else {
      return 0;
    }
  }

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
  fetch() {
    if (!(this.lookup[this.opcode][1] == this.IMP)) {
      // current opcode isnt in imply mode
      this.fetched = this.read(this.addr_abs);
    }
  }

  //opcodes
  ADC() {
    return 0;
  }

  AND() {
    // bitwise and
    this.fetch();
    this.a &= this.fetched;
    this.SetFlag(Flags.Z, this.a === 0x00 ? true : false); // zero flag
    this.SetFlag(Flags.N, this.a & 0x80 ? true : false); // negative flag
    return 1;
  }

  ASL() {
    return 0;
  }
  BCC() {
    // branch if carry clear
    if (!this.GetFlag(Flags.C)) {
      this.cycles++;
      this.addr_abs = this.pc + this.addr_rel;

      if ((this.addr_abs & 0xff00) != (this.pc & 0xff00)) {
        this.cycles++;
      }

      this.pc = this.addr_abs;
    }
    return 0;
  }

  BCS() {
    // branch if carry
    if (this.GetFlag(Flags.C)) {
      this.cycles++;
      this.addr_abs = this.pc + this.addr_rel;

      if ((this.addr_abs & 0xff00) != (this.pc & 0xff00)) {
        this.cycles++;
      }

      this.pc = this.addr_abs;
    }
    return 0;
  }
  BEQ() {
    // branch if equal
    if (this.GetFlag(Flags.Z)) {
      this.cycles++;
      this.addr_abs = this.pc + this.addr_rel;

      if ((this.addr_abs & 0xff00) != (this.pc & 0xff00)) {
        this.cycles++;
      }

      this.pc = this.addr_abs;
    }
    return 0;
  }

  BIT() {
    return 0;
  }

  BMI() {
    // branch if negative
    if (this.GetFlag(Flags.N)) {
      this.cycles++;
      this.addr_abs = this.pc + this.addr_rel;

      if ((this.addr_abs & 0xff00) != (this.pc & 0xff00)) {
        this.cycles++;
      }

      this.pc = this.addr_abs;
    }
    return 0;
  }

  BNE() {
    // branch if not equal
    if (!this.GetFlag(Flags.Z)) {
      this.cycles++;
      this.addr_abs = this.pc + this.addr_rel;

      if ((this.addr_abs & 0xff00) != (this.pc & 0xff00)) {
        this.cycles++;
      }

      this.pc = this.addr_abs;
    }
    return 0;
  }

  BPL() {
    // branch if not equal
    if (!this.GetFlag(Flags.N)) {
      this.cycles++;
      this.addr_abs = this.pc + this.addr_rel;

      if ((this.addr_abs & 0xff00) != (this.pc & 0xff00)) {
        this.cycles++;
      }

      this.pc = this.addr_abs;
    }
    return 0;
  }

  BRK() {
    return 0;
  }
  BVC() {
    // branch if overflow
    if (!this.GetFlag(Flags.V)) {
      this.cycles++;
      this.addr_abs = this.pc + this.addr_rel;

      if ((this.addr_abs & 0xff00) != (this.pc & 0xff00)) {
        this.cycles++;
      }

      this.pc = this.addr_abs;
    }
    return 0;
  }

  BVS() {
    // branch if not overflow
    if (this.GetFlag(Flags.V)) {
      this.cycles++;
      this.addr_abs = this.pc + this.addr_rel;

      if ((this.addr_abs & 0xff00) != (this.pc & 0xff00)) {
        this.cycles++;
      }

      this.pc = this.addr_abs;
    }
    return 0;
  }

  CLC() {
    return 0;
  }
  CLD() {
    return 0;
  }
  CLI() {
    return 0;
  }
  CLV() {
    return 0;
  }
  CMP() {
    return 0;
  }
  CPX() {
    return 0;
  }
  CPY() {
    return 0;
  }
  DEC() {
    return 0;
  }
  DEX() {
    return 0;
  }
  DEY() {
    return 0;
  }
  EOR() {
    return 0;
  }
  INC() {
    return 0;
  }
  INX() {
    return 0;
  }
  INY() {
    return 0;
  }
  JMP() {
    return 0;
  }
  JSR() {
    return 0;
  }
  LDA() {
    return 0;
  }
  LDX() {
    return 0;
  }
  LDY() {
    return 0;
  }
  LSR() {
    return 0;
  }
  NOP() {
    return 0;
  }
  ORA() {
    return 0;
  }
  PHA() {
    return 0;
  }
  PHP() {
    return 0;
  }
  PLA() {
    return 0;
  }
  PLP() {
    return 0;
  }
  ROL() {
    return 0;
  }
  ROR() {
    return 0;
  }
  RTI() {
    return 0;
  }
  RTS() {
    return 0;
  }
  SBC() {
    return 0;
  }
  SEC() {
    return 0;
  }
  SED() {
    return 0;
  }
  SEI() {
    return 0;
  }
  STA() {
    return 0;
  }
  STX() {
    return 0;
  }
  STY() {
    return 0;
  }
  TAX() {
    return 0;
  }
  TAY() {
    return 0;
  }
  TSX() {
    return 0;
  }
  TXA() {
    return 0;
  }
  TXS() {
    return 0;
  }
  TYA() {
    return 0;
  }
  XXX() {
    return 0;
  }

  // lookup table
  // [FUNCTION, MODE, CYCLES]
  lookup = {
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
    0xff: [this.XXX, this.IMP, 7],
  };

  // public methods
  connectBus(bus: Bus) {
    this.bus = bus;
  }

  GetFlag(flagName: Flags) {
    switch (flagName) {
      case Flags.B:
        return this.status.B;
      case Flags.C:
        return this.status.C;
      case Flags.D:
        return this.status.D;
      case Flags.I:
        return this.status.I;
      case Flags.N:
        return this.status.N;
      case Flags.U:
        return this.status.U;
      case Flags.V:
        return this.status.V;
      case Flags.Z:
        return this.status.Z;
    }
  }

  SetFlag(flag: Flags, state: boolean) {
    switch (flag) {
      case Flags.B: {
        this.status.B = state;
        break;
      }
      case Flags.C: {
        this.status.C = state;
        break;
      }
      case Flags.D: {
        this.status.D = state;
        break;
      }
      case Flags.I: {
        this.status.I = state;
        break;
      }
      case Flags.N: {
        this.status.N = state;
        break;
      }
      case Flags.U: {
        this.status.U = state;
        break;
      }
      case Flags.V: {
        this.status.V = state;
        break;
      }
      case Flags.Z: {
        this.status.Z = state;
        break;
      }
    }
  }

  write(adress: number, data: number) {
    this.bus.write(adress, data);
  }

  read(adress: number, readOnly: boolean = false) {
    return this.bus.read(adress, readOnly);
  }
}
