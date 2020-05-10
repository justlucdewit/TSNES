import { Mapper } from "../mapper"
import { Reference } from "tools/reference"


export class Mapper000 extends Mapper{
	cpuMapRead(addres:number, mapped_address:Reference<number>){
		if (addres >= 0x8000 && addres <= 0xFFFF){
			mapped_address.value = addres & (this.prgBanks > 1 ? 0x7FFF : 0x3FFF);// 32 or 64k ROM
			return true;
		}
		return false;
	}

	cpuMapWrite(addres:number, mapped_address:Reference<number>){
		if (addres >= 0x8000 && addres <= 0xFFFF){
			mapped_address.value = addres & (this.prgBanks > 1 ? 0x7FFF : 0x3FFF);// 32 or 64k ROM
			return true;
		}
		return false;
	}

	ppuMapRead(addres:number, mapped_address:Reference<number>){
		if (addres >= 0x0000 && addres <= 0x1FFF){
			mapped_address.value = addres;
			return true;
		}
		return false;
	}

	ppuMapWrite(addres:number, mapped_address:Reference<number>){
		return false;
	}
}