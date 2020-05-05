import { Bus } from "./bus";
import { CPU6502 } from "./6502";

console.clear();
console.log("TSNES emulator");

const cpu = new CPU6502();
cpu.connectBus(new Bus());
