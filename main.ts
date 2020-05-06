import { Bus } from "./bus";
import { CPU6502 } from "./6502";
import { printPage, printRegisters } from "./6502debug";

console.clear();
console.log("TSNES emulator");

const cpu = new CPU6502();

/*
    *=$8000
    LDX #10
    STX $0000
    LDX #3
    STX $0001
    LDY $0000
    LDA #0
    CLC
    loop
    ADC $0001
    DEY
    DNE loop
    STA $0002
    NOP
    NOP
    NOP
*/
const program = [
  0xa2,
  0x0a,
  0x8e,
  0x00,
  0x00,
  0xa2,
  0x03,
  0x8e,
  0x01,
  0x00,
  0xac,
  0x00,
  0x00,
  0xa9,
  0x00,
  0x18,
  0x6d,
  0x01,
  0x00,
  0x88,
  0xd0,
  0xfa,
  0x8d,
  0x02,
  0x00,
  0xea,
  0xea,
  0xea,
];

cpu.loadProgram(0x8000, program);
cpu.cycle();
printPage(cpu, 0x00);
printPage(cpu, 0x80);
printRegisters(cpu);
