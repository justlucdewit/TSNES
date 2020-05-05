import { CPU6502 } from "./6502";

export class Bus {
  // devices
  RAM: ArrayBuffer;
  CPU: CPU6502;

  Bus() {
    this.CPU = new CPU6502();
    this.RAM = new ArrayBuffer(64 * 1024);
  }

  write(adress: number, data: number) {
    if (adress >= 0x0 && adress <= 0xffff) {
      this.RAM[adress] = data;
    }
  }

  read(adress: number, readOnly: boolean): number {
    if (adress >= 0x0 && adress <= 0xffff) {
      return this.RAM[adress];
    }

    return 0x0;
  }
}
