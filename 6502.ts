import { Bus } from './bus'
import O from './opcodes'

enum Flags{
	C,	// carry
	Z,	// zero
	I,  // disable interupts
	D,	// decimal mode
	B,	// break
	U,	// unused
	V,	// overflow
	N	// negative
}

interface Instruction{
	name:string,
	cycles:number,
	mode:()=>void,
	function:()=>number,
}

export class CPU6502{
	bus:Bus = undefined;

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
	IMP(){ // implied
		this.fetched = this.a;
		return 0;
	}

	IMM(){ // immediate
		this.addr_abs = this.pc;
		this.pc++;
		return 0;
	}

	ZP0(){ // zero page
		this.addr_abs = this.read(this.pc) & 0x00FF;
		this.pc++;
		return 0;
	}

	ZPX(){ // zero page with offset from X register
		this.addr_abs = this.read(this.pc + this.x) & 0x00FF;
		this.pc++;
		return 0;
	}

	ZPY(){ // zero page with offset from Y register
		this.addr_abs = this.read(this.pc + this.y) & 0x00FF;
		this.pc++;
		return 0;
	}

	REL(){}

	ABS(){ // absolute
		const low = this.read(this.pc);
		this.pc++;
		const high = this.read(this.pc);
		this.pc++;

		this.addr_abs = (high << 8) | low;
		return 0;
	}
	
	ABX(){ // absolute with offset from X register
		const low = this.read(this.pc);
		this.pc++;
		const high = this.read(this.pc);
		this.pc++;

		this.addr_abs = ((high << 8) | low) + this.x;

		if ((this.addr_abs & 0xFF00) != (high << 8)){
			return 1;
		}
		return 0;
	}

	ABY(){ // absolute with offset from Y register
		const low = this.read(this.pc);
		this.pc++;
		const high = this.read(this.pc);
		this.pc++;

		this.addr_abs = ((high << 8) | low) + this.y;
		if ((this.addr_abs & 0xFF00) != (high << 8)){
			return 1;
		}
		return 0;
	}

	IND(){}
	IZX(){}
	IZY(){}

	cycle(){
		if (this.cycles === 0){
			this.opcode = this.read(this.pc);
			this.pc ++;
			this.cycles = this.lookup[this.opcode][2]; 			// set needed cycle count
			const extraCycles1:number = this.lookup[this.opcode][1]();	// setup address mode
			const extraCycles2:number = this.lookup[this.opcode][0]();	// execute instuction

			this.cycles += (extraCycles1 & extraCycles2);
		}
		this.cycles--;
	};
	reset(){};
	requestInterupt(){};
	nonMascableInterupt(){};
	fetch(){};

	// lookup table
	// [FUNCTION, MODE, CYCLES]
	lookup = {
		0x00: [O.BRK,this.IMM,7], 0x01: [O.ORA,this.IZX,6], 0x02: [O.XXX,this.IMP,2], 0x03: [O.XXX,this.IMP,8],
		0x04: [O.NOP,this.IMP,3], 0x05: [O.ORA,this.ZP0,3], 0x06: [O.ASL,this.ZP0,5], 0x07: [O.XXX,this.IMP,5],
		0x08: [O.PHP,this.IMP,3], 0x09: [O.ORA,this.IMM,2], 0x0A: [O.ASL,this.IMP,2], 0x0B: [O.XXX,this.IMP,2],
		0x0C: [O.NOP,this.IMP,4], 0x0D: [O.ORA,this.ABS,4], 0x0E: [O.ASL,this.ABS,6], 0x0F: [O.XXX,this.IMP,6],
		0x10: [O.BPL,this.REL,2], 0x11: [O.ORA,this.IZY,5], 0x12: [O.XXX,this.IMP,2], 0x13: [O.XXX,this.IMP,8],
		0x14: [O.NOP,this.IMP,4], 0x15: [O.ORA,this.ZPX,4], 0x16: [O.ASL,this.ZPX,6], 0x17: [O.XXX,this.IMP,6],
		0x18: [O.CLC,this.IMP,2], 0x19: [O.ORA,this.ABY,4], 0x1A: [O.NOP,this.IMP,2], 0x1B: [O.XXX,this.IMP,7],
		0X1C: [O.NOP,this.IMP,4], 0x1D: [O.ORA,this.ABX,4], 0x1E: [O.ASL,this.ABX,7], 0x1F: [O.XXX,this.IMP,7],
		0X20: [O.JSR,this.ABS,6], 0x21: [O.AND,this.IZX,6], 0x22: [O.XXX,this.IMP,2], 0x23: [O.XXX,this.IMP,8],
		0X24: [O.BIT,this.ZP0,3], 0x25: [O.AND,this.ZP0,3], 0x26: [O.ROL,this.ZP0,5], 0x27: [O.XXX,this.IMP,5],
		0X28: [O.PLP,this.IMP,4], 0x29: [O.AND,this.IMM,2], 0x2A: [O.ROL,this.IMP,2], 0x2B: [O.XXX,this.IMP,2],
		0X2C: [O.BIT,this.ABS,4], 0x2D: [O.AND,this.ABS,4], 0x2E: [O.ROL,this.ABS,6], 0x2F: [O.XXX,this.IMP,6],
		0X30: [O.BMI,this.REL,2], 0x31: [O.AND,this.IZY,5], 0x32: [O.XXX,this.IMP,2], 0x33: [O.XXX,this.IMP,8],
		0X34: [O.NOP,this.IMP,4], 0x35: [O.AND,this.ZPX,4], 0x36: [O.ROL,this.ZPX,6], 0x37: [O.XXX,this.IMP,6],
		0X38: [O.SEC,this.IMP,2], 0x39: [O.AND,this.ABY,4], 0x3A: [O.NOP,this.IMP,2], 0x3B: [O.XXX,this.IMP,7],
		0X3C: [O.NOP,this.IMP,4], 0x3D: [O.AND,this.ABX,4], 0x3E: [O.ROL,this.ABX,7], 0x3F: [O.XXX,this.IMP,7],
		0X40: [O.RTI,this.IMP,6], 0x41: [O.EOR,this.IZX,6], 0x42: [O.XXX,this.IMP,2], 0x43: [O.XXX,this.IMP,8],
		0X44: [O.NOP,this.IMP,3], 0x45: [O.EOR,this.ZP0,3], 0x46: [O.LSR,this.ZP0,5], 0x47: [O.XXX,this.IMP,5],
		0X48: [O.PHA,this.IMP,3], 0x49: [O.EOR,this.IMM,2], 0x4A: [O.LSR,this.IMP,2], 0x4B: [O.XXX,this.IMP,2],
		0X4C: [O.JMP,this.ABS,3], 0x4D: [O.EOR,this.ABS,4], 0x4E: [O.LSR,this.ABS,6], 0x4F: [O.XXX,this.IMP,6],
		0X50: [O.BVC,this.REL,2], 0x51: [O.EOR,this.IZY,5], 0x52: [O.XXX,this.IMP,2], 0x53: [O.XXX,this.IMP,8],
		0X54: [O.NOP,this.IMP,4], 0x55: [O.EOR,this.ZPX,4], 0x56: [O.LSR,this.ZPX,6], 0x57: [O.XXX,this.IMP,6],
		0X58: [O.CLI,this.IMP,2], 0x59: [O.EOR,this.ABY,4], 0x5A: [O.NOP,this.IMP,2], 0x5B: [O.XXX,this.IMP,7],
		0X5C: [O.NOP,this.IMP,4], 0x5D: [O.EOR,this.ABX,4], 0x5E: [O.LSR,this.ABX,7], 0x5F: [O.XXX,this.IMP,7],
		0X60: [O.RTS,this.IMP,6], 0x61: [O.ADC,this.IZX,6], 0x62: [O.XXX,this.IMP,2], 0x63: [O.XXX,this.IMP,8],
		0X64: [O.NOP,this.IMP,3], 0x65: [O.ADC,this.ZP0,3], 0x66: [O.ROR,this.ZP0,5], 0x67: [O.XXX,this.IMP,5],
		0X68: [O.PLA,this.IMP,4], 0x69: [O.ADC,this.IMM,2], 0x6A: [O.ROR,this.IMP,2], 0x6B: [O.XXX,this.IMP,2],
		0X6C: [O.JMP,this.IND,5], 0x6D: [O.ADC,this.ABS,4], 0x6E: [O.ROR,this.ABS,6], 0x6F: [O.XXX,this.IMP,6],
		0X70: [O.BVS,this.REL,2], 0x71: [O.ADC,this.IZY,5], 0x72: [O.XXX,this.IMP,2], 0x73: [O.XXX,this.IMP,8],
		0X74: [O.NOP,this.IMP,4], 0x75: [O.ADC,this.ZPX,4], 0x76: [O.ROR,this.ZPX,6], 0x77: [O.XXX,this.IMP,6],
		0X78: [O.SEI,this.IMP,2], 0x79: [O.ADC,this.ABY,4], 0x7A: [O.NOP,this.IMP,2], 0x7B: [O.XXX,this.IMP,7],
		0X7C: [O.NOP,this.IMP,4], 0x7D: [O.ADC,this.ABX,4], 0x7E: [O.ROR,this.ABX,7], 0x7F: [O.XXX,this.IMP,7],
		0X80: [O.NOP,this.IMP,2], 0x81: [O.STA,this.IZX,6], 0x82: [O.NOP,this.IMP,2], 0x83: [O.XXX,this.IMP,6],
		0X84: [O.STY,this.ZP0,3], 0x85: [O.STA,this.ZP0,3], 0x86: [O.STX,this.ZP0,3], 0x87: [O.XXX,this.IMP,3],
		0X88: [O.DEY,this.IMP,2], 0x89: [O.NOP,this.IMP,2], 0x8A: [O.TXA,this.IMP,2], 0x8B: [O.XXX,this.IMP,2],
		0X8C: [O.STY,this.ABS,4], 0x8D: [O.STA,this.ABS,4], 0x8E: [O.STX,this.ABS,4], 0x8F: [O.XXX,this.IMP,4],
		0X90: [O.BCC,this.REL,2], 0x91: [O.STA,this.IZY,6], 0x92: [O.XXX,this.IMP,2], 0x93: [O.XXX,this.IMP,6],
		0X94: [O.STY,this.ZPX,4], 0x95: [O.STA,this.ZPX,4], 0x96: [O.STX,this.ZPY,4], 0x97: [O.XXX,this.IMP,4],
		0X98: [O.TYA,this.IMP,2], 0x99: [O.STA,this.ABY,5], 0x9A: [O.TXS,this.IMP,2], 0x9B: [O.XXX,this.IMP,5],
		0X9C: [O.NOP,this.IMP,5], 0x9D: [O.STA,this.ABX,5], 0x9E: [O.XXX,this.IMP,5], 0x9F: [O.XXX,this.IMP,5],
		0XA0: [O.LDY,this.IMM,2], 0xA1: [O.LDA,this.IZX,6], 0xA2: [O.LDX,this.IMM,2], 0xA3: [O.XXX,this.IMP,6],
		0XA4: [O.LDY,this.ZP0,3], 0xA5: [O.LDA,this.ZP0,3], 0xA6: [O.LDX,this.ZP0,3], 0xA7: [O.XXX,this.IMP,3],
		0XA8: [O.TAY,this.IMP,2], 0xA9: [O.LDA,this.IMM,2], 0xAA: [O.TAX,this.IMP,2], 0xAB: [O.XXX,this.IMP,2],
		0XAC: [O.LDY,this.ABS,4], 0xAD: [O.LDA,this.ABS,4], 0xAE: [O.LDX,this.ABS,4], 0xAF: [O.XXX,this.IMP,4],
		0XB0: [O.BCS,this.REL,2], 0xB1: [O.LDA,this.IZY,5], 0xB2: [O.XXX,this.IMP,2], 0xB3: [O.XXX,this.IMP,5],
		0XB4: [O.LDY,this.ZPX,4], 0xB5: [O.LDA,this.ZPX,4], 0xB6: [O.LDX,this.ZPY,4], 0xB7: [O.XXX,this.IMP,4],
		0XB8: [O.CLV,this.IMP,2], 0xB9: [O.LDA,this.ABY,4], 0xBA: [O.TSX,this.IMP,2], 0xBB: [O.XXX,this.IMP,4],
		0XBC: [O.LDY,this.ABX,4], 0xBD: [O.LDA,this.ABX,4], 0xBE: [O.LDX,this.ABY,4], 0xBF: [O.XXX,this.IMP,4],
		0XC0: [O.CPY,this.IMM,2], 0XC1: [O.CMP,this.IZX,6], 0XC2: [O.NOP,this.IMP,2], 0XC3: [O.XXX,this.IMP,8],
		0XC4: [O.CPY,this.ZP0,3], 0XC5: [O.CMP,this.ZP0,3], 0XC6: [O.DEC,this.ZP0,5], 0XC7: [O.XXX,this.IMP,5],
		0XC8: [O.INY,this.IMP,2], 0XC9: [O.CMP,this.IMM,2], 0XCA: [O.DEX,this.IMP,2], 0XCB: [O.XXX,this.IMP,2],
		0XCC: [O.CPY,this.ABS,4], 0XCD: [O.CMP,this.ABS,4], 0XCE: [O.DEC,this.ABS,6], 0XCF: [O.XXX,this.IMP,6],
		0XD4: [O.NOP,this.IMP,4], 0xD1: [O.CMP,this.ZPX,4], 0xD2: [O.DEC,this.ZPX,6], 0xD3: [O.XXX,this.IMP,6],
		0XD0: [O.BNE,this.REL,2], 0xD5: [O.CMP,this.IZY,5], 0xD6: [O.XXX,this.IMP,2], 0xD7: [O.XXX,this.IMP,8],
		0XD8: [O.CLD,this.IMP,2], 0xD9: [O.CMP,this.ABY,4], 0xDA: [O.NOP,this.IMP,2], 0xDB: [O.XXX,this.IMP,7],
		0XDC: [O.NOP,this.IMP,4], 0xDD: [O.CMP,this.ABX,4], 0xDE: [O.DEC,this.ABX,7], 0xDF: [O.XXX,this.IMP,7],
		0XE0: [O.CPX,this.IMM,2], 0xE1: [O.SBC,this.IZX,6], 0xE2: [O.NOP,this.IMP,2], 0xE3: [O.XXX,this.IMP,8],
		0XE4: [O.CPX,this.ZP0,3], 0xE5: [O.SBC,this.ZP0,3], 0xE6: [O.INC,this.ZP0,5], 0xE7: [O.XXX,this.IMP,5],
		0XE8: [O.INX,this.IMP,2], 0xE9: [O.SBC,this.IMM,2], 0xEA: [O.NOP,this.IMP,2], 0xEB: [O.SBC,this.IMP,2],
		0XEC: [O.CPX,this.ABS,4], 0xED: [O.SBC,this.ABS,4], 0xEE: [O.INC,this.ABS,6], 0xEF: [O.XXX,this.IMP,6],
		0XF0: [O.BEQ,this.REL,2], 0xF1: [O.SBC,this.IZY,5], 0xF2: [O.XXX,this.IMP,2], 0xF3: [O.XXX,this.IMP,8],
		0XF4: [O.NOP,this.IMP,4], 0xF5: [O.SBC,this.ZPX,4], 0xF6: [O.INC,this.ZPX,6], 0xF7: [O.XXX,this.IMP,6],
		0XF8: [O.SED,this.IMP,2], 0xF9: [O.SBC,this.ABY,4], 0xFA: [O.NOP,this.IMP,2], 0xFB: [O.XXX,this.IMP,7],
		0XFC: [O.NOP,this.IMP,4], 0xFD: [O.SBC,this.ABX,4], 0xFE: [O.INC,this.ABX,7], 0xFF: [O.XXX,this.IMP,7],
	}

	// public methods
	connectBus(bus:Bus){
		this.bus = bus;
	}

	GetFlag(){

	}

	SetFlag(){

	}

	write(adress:number, data:number){
		this.bus.write(adress, data);
	}

	read(adress:number, readOnly:boolean=false){
		return this.bus.read(adress, readOnly);
	}
}