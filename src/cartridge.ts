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

function openFile(): Promise<File> {
  return new Promise((resolve) => {
    let input = document.createElement("input");
    input.style.display = "none";
    if (input != null) {
      input.type = "file";

      input.onchange = (_) => {
        if (input.files != null) {
          let files = Array.from(input.files);
          resolve(files[0]);
        }
      };

      input.click();
    }
  });
}

export class Cardridge {
  PRGMemory = [];
  CHRMemory = [];

  mapperID = 0;
  PRGBanks = 0;
  CHRBanks = 0;

  constructor() {
    let content = openFile();
    content.then((content) => {
      content.text().then((text) => {
        console.log();
        let LoadedHeader: Header = {
          name: text.substring(0, 4),
          prg_chunks: text.charCodeAt(4),
          chr_chunks: text.charCodeAt(5), //text.substring(4, 12),
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
          case 1: {
            break;
          }
          case 2: {
            break;
          }
          case 3: {
            break;
          }
        }
        console.log(LoadedHeader);
      });
    });
  }

  cpuWrite(adress: number, data: number) {}

  cpuRead(adress: number, readOnly: boolean) {}

  ppuWrite(adress: number, data: number) {}

  ppuRead(adress: number, readOnly: boolean) {}
}
