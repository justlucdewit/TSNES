import { openFile } from "./tools/openFile"
import { Mapper } from "./mapper"
import { Mapper000 } from "./mappers/mapper000"
import { Reference } from "./tools/reference"

interface Header {
  name: string; // 4bytes
  prg_chunks: number; // 8 bytes
  chr_chunks: number; // 8 bytes
  mapper1: number; // 8 bytes
  mapper2: number; // 8 bytes
  prg_ram_size: number; // 8 bytes
  tv_system1: number; // 8 bytes
  tv_system2: number; // 8 bytes
  unused: number[]; // 5 bytes
}

export class Cardridge {
  mapper:Mapper;

  PRGMemory?:Uint8Array;
  CHRMemory?:Uint8Array;

  mapperID = 0;
  PRGBanks = 0;
  CHRBanks = 0;

  constructor() {
    let content = openFile();
    content.then((content) => {
      content.text().then((text) => {
        let LoadedHeader: Header = {
          name: text.substring(0, 4),
          prg_chunks: text.charCodeAt(4),
          chr_chunks: text.charCodeAt(5),
          mapper1: text.charCodeAt(6),
          mapper2: text.charCodeAt(7),
          prg_ram_size: text.charCodeAt(8),
          tv_system1: text.charCodeAt(9),
          tv_system2: text.charCodeAt(10),
          unused: text
            .substr(11, 4)
            .split("")
            .map((v) => v.charCodeAt(0)),
        };
        this.mapperID =
          ((LoadedHeader.mapper2 >> 4) << 4) | (LoadedHeader.mapper1 >> 4);

        let filetype = 1;
        switch (filetype) {
          case 0: {
            break;
          }
          case 1: {
            // load program data
            this.PRGBanks = LoadedHeader.prg_chunks;
            this.PRGMemory = new Uint8Array(this.PRGBanks * 16384);
            for (let i = 0; i < this.PRGMemory.length; i++){
              this.PRGMemory[i] = text.charCodeAt(i+526);
            }

            this.CHRBanks = LoadedHeader.chr_chunks;
            this.CHRMemory = new Uint8Array(this.CHRBanks * 8192);
            for (let i = 0; i < this.CHRMemory.length; i++){
              this.CHRMemory[i] = text.charCodeAt(i+526+this.PRGMemory.length);
            }
            break;
          }
          case 2: {
            break;
          }
        }

        switch (this.mapperID){
          case 0: this.mapper = new Mapper000(this.PRGBanks, this.CHRBanks);
          default: this.mapper = new Mapper000(this.PRGBanks, this.CHRBanks);
        }

        console.log(this.PRGMemory);
        console.log(this.CHRMemory);
      });
    });
  }

  cpuWrite(adress: number, data: number) {
    const mappedAddres:Reference<number> = new Reference(0);
    if (this.mapper.cpuMapWrite(adress, mappedAddres) && this.PRGMemory != undefined){
      const data = this.PRGMemory[mappedAddres.value];
      return true;
    }
    return false;
  }

  cpuRead(adress: number, data: number) {
    const mappedAddres:Reference<number> = new Reference(0);
    if (this.mapper.cpuMapRead(adress, mappedAddres) && this.PRGMemory != undefined){
      const data = this.PRGMemory[mappedAddres.value];
      return true;
    }
    return false;
  }

  ppuWrite(adress: number, data: number) {}

  ppuRead(adress: number, data: number) {}
}
