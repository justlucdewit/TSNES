import { CPU6502 } from "./6502";

const fillInHex = (hex: string, count: number) =>
  "0".repeat(count - hex.length) + hex;

const getRow = (ram: Uint8Array, row: number) => {
  let ret = "";
  for (let i = 0; i < 16; i++) {
    ret += fillInHex(ram[row + i].toString(16).toUpperCase(), 2) + " ";
  }
  return ret;
};

export function printPage(cpu: CPU6502, page: number) {
  console.log(`\nview into page 0x${page.toString(16)}:`);
  for (let i = 0; i < 16; i++) {
    const n = fillInHex(((page << 8) | (i << 4)).toString(16).toUpperCase(), 4);
    const row = getRow(cpu.bus.RAM, parseInt(n, 16));
    console.log(`[${n}]: ${row}`);
  }
}

export function printRegisters(cpu: CPU6502) {
  console.log(
    `\nRegisters: 
    \tA: 0x${fillInHex(cpu.a.toString(16), 2)}
    \tX: 0x${fillInHex(cpu.x.toString(16), 2)}
    \tY: 0x${fillInHex(cpu.y.toString(16), 2)}
    `
  );
}
