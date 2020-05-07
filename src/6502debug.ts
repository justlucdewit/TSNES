import { CPU6502 } from "./6502";

export function fillInHex(hex: string, count: number) {
  return "0".repeat(count - hex.length) + hex;
}

const getRow = (ram: Uint8Array, row: number, pc: number) => {
  let ret = "";
  for (let i = 0; i < 16; i++) {
    const newHex = fillInHex(ram[row + i].toString(16).toUpperCase(), 2);
    if (row + i === pc) {
      ret += "<span class='blue'>" + newHex + "</span> ";
    } else {
      ret += newHex + " ";
    }
  }
  return ret;
};

export function printPage(cpu: CPU6502, page: number) {
  let ret = "";
  for (let i = 0; i < 16; i++) {
    const n = fillInHex(((page << 8) | (i << 4)).toString(16).toUpperCase(), 4);
    const row = getRow(cpu.bus.RAM, parseInt(n, 16), cpu.pc);
    ret += `[${n}]: ${row}<br />`;
  }
  return ret;
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

export function printFlags(cpu: CPU6502) {
  console.log(`\nCPU flag Info:
      carry:\t${cpu.GetFlag(0) ? "true" : "false"}
      zero:\t${cpu.GetFlag(1) ? "true" : "false"}
      interup:\t${cpu.GetFlag(2) ? "true" : "false"}
      decimal:\t${cpu.GetFlag(3) ? "true" : "false"}
      break:\t${cpu.GetFlag(4) ? "true" : "false"}
      unused:\t${cpu.GetFlag(5) ? "true" : "false"}
      overflow:\t${cpu.GetFlag(6) ? "true" : "false"}
      negative:\t${cpu.GetFlag(7) ? "true" : "false"}
      `);
}

export function printInfo(cpu: CPU6502) {
  console.log(`\nCPU Info:
    \tclock cycles: ${cpu.totalCycles}
    \treading at: 0x${cpu.pc.toString(16)}
    `);
}
