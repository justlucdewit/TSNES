import { Cardridge } from "./cartridge";

export class PPU {
  cart: Cardridge | undefined;
  tNameSpaces = [new Uint8Array(1024), new Uint8Array(1024)];
  tPalette = [new Uint8Array(32)];
  tPattern = [new Uint8Array(4096), new Uint8Array(4096)]; // normally in cartridge

  cpuWrite(adress: number, data: number) {
    switch (adress) {
      case 0: {
        break;
      }
      case 1: {
        break;
      }
      case 2: {
        break;
      }
      case 3: {
        break;
      }
      case 4: {
        break;
      }
      case 5: {
        break;
      }
      case 6: {
        break;
      }
      case 7: {
        break;
      }
    }
  }

  cpuRead(adress: number, readOnly: boolean = false) {
    let data = 0x00;
    switch (adress) {
      case 0: {
        break;
      }
      case 1: {
        break;
      }
      case 2: {
        break;
      }
      case 3: {
        break;
      }
      case 4: {
        break;
      }
      case 5: {
        break;
      }
      case 6: {
        break;
      }
      case 7: {
        break;
      }
    }
    return data;
  }

  ppuWrite(adress: number, data: number) {
    adress &= 0x3fff;
    
    if (this.cart != undefined && this.cart.ppuWrite(adress, data)){

    }
  }

  ppuRead(adress: number, readOnly: boolean = false) {
    let data = 0x00;
    adress &= 0x3fff;

    if (this.cart != undefined && this.cart.ppuRead(adress, data)){

    }

    return data;
  }

  connectCartridge(cart: Cardridge) {
    this.cart = cart;
  }

  clock() {}
}
