import { CPU6502 } from "./6502";
import { PPU } from "./PPU";
import { Cardridge } from "./cartridge";

export class Bus {
  // devices
  cpu = new CPU6502();
  cpuRAM = new Uint8Array(2048);
  ppu = new PPU();
  cart?: Cardridge;

  systemClockCounter = 0;

  constructor() {
    this.cpu.bus = this;
  }

  cpuWrite(adress: number, data: number) {
    if (this.cart != undefined && this.cart.cpuWrite(adress, data)){

    } else if (adress >= 0x00000 && adress <= 0x1fff) {
      this.cpuRAM[adress & 0x07ff] = data;
    } else if (adress >= 0x2000 && adress <= 0x3fff) {
      this.ppu.cpuWrite(adress & 0x0007, data);
    }
  }

  cpuRead(adress: number, readOnly: boolean): number {
    if (this.cart != undefined && this.cart.cpuRead(adress)){
      
    }if (adress >= 0x0000 && adress <= 0x1fff) {
      return this.cpuRAM[adress & 0x07ff];
    } else if (adress >= 0x2000 && adress <= 0x3fff) {
      return this.ppu.cpuRead(adress & 0x0007);
    }
    return 0x0;
  }

  insertCartridge(cart: Cardridge) {
    this.cart = cart;
    this.ppu.connectCartridge(cart);
  }

  reset() {
    this.cpu.reset();
    this.systemClockCounter = 0;
  }
  clock() {}
}
