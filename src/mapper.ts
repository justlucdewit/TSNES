import { Reference } from "tools/reference" 

export class Mapper{
	prgBanks=0;
	chrBanks=0;

	constructor(prgBanks:number, chrBanks:number){
		this.prgBanks = prgBanks;
		this.chrBanks = chrBanks;
	}

	cpuMapRead(addres:number, mapped_address:Reference<number>){return false;}
	cpuMapWrite(addres:number, mapped_address:Reference<number>){return false;}
	ppuMapRead(addres:number, mapped_address:Reference<number>){return false;}
	ppuMapWrite(addres:number, mapped_address:Reference<number>){return false;}
}