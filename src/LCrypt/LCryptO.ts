import {LCryptKey} from "./Global";
import { LCrypt3C } from "./LCrypt3C";

export class LCryptO extends LCrypt3C{

    private readonly k:Array<LCryptKey>;

    constructor(keys:Buffer, passphrase:string) {
        super();
        this.k = LCryptO.deflateKey(keys, passphrase);
    }

    public encrypt( message:string, encoding:BufferEncoding = "utf-8" ):string {return LCryptO.encryptDataA(message, this.k, encoding);}

    public decrypt( message: string ):string {return LCryptO.decryptDataA(message, this.k);}

    public static from(keys:Buffer, passphrase:string):LCryptO{return new LCryptO(keys, passphrase);}
}