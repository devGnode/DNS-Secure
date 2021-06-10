import {defKeys, LCryptKey, peerKey, peerKeyStr, sDefKeys} from "./Global";
import {DWORD} from "struct/lib/Dword";
import {Byte} from "struct/lib/Byte";
import {Struct} from "struct/lib/Struct";
import {RuntimeException} from "lib-utils-ts/src/Exception";
import {WORD} from "struct/lib/Word";

abstract class LCrypt {

    private static d( e:number, phi:number, x:number = null, salt:number = 0 ):number{
        let bcl:number = 0;
        try{
            x = x || e+1;
            while( !( ( x * e )%phi === 1 && x.isPrime() ) ){
                x++;
                if( bcl >= 150000 ){
                    x = -1;
                    break;
                }
                bcl++;
            }
        }catch(e){
            return -1;
        }
        return ( !!Math.floor( Math.random( )*4 ) && !!Math.floor( Math.random( )*4 ) ) ? this.d( e, phi, x ) :  x;
    }

    private static e( x:number ):number{
        let out:number = -1;
        try{
            while( !( ( out = Math.floor( (Math.random( )*0x0fffffff)+( x+1 ) ) ).isPrime( ) )  );
        }catch(e){
            out = -1;
        }
        return out;
    }

    private static modulus(  ):number{
        let x:number = 0,bcl:number = 0;

        x--;
        try{
            while( ( ( x = Math.floor( ( Math.random()*0x10000 )+256 ) )%2 === 1  ) );
        }catch(e){
            x = -1;
        }
        return x;
    }

    public static genKey( byteLength:number, mod:number = null ):peerKey{
        let ph:number = mod || LCrypt.modulus( ),
            len:number = 0, tmpP:number, tmpQ:number,
            ret: peerKey = {
                pbk:[], pvk:[],
                mod:ph, len:byteLength
            };

        while (len < byteLength) {
            if (((tmpP = LCrypt.e(ph)) > -1 && (tmpQ = LCrypt.d(tmpP, ph)) > -1)) {
                ret.pvk.push(tmpP);
                ret.pbk.push(tmpQ);
                len++;
            }
        }
        return ret;
    }

    public static crypt( input:string, k:number[], m:number ):Buffer{
        let i:number= 0, j:number = 0,r:string = "";
        if( input.length > 0 ){

            let rr:number;
            while( input[ i ] ){
                r += String.fromCharCode( rr = (  input.charCodeAt( i )  * k[ ( j = j >= k.length ? 0 : j ) ] ) % m);
                i++;
                j++;
            }
        }
        return Buffer.from(r);
    }
}

export class LCrypt3C extends LCrypt{

    private static readonly PERMUTE_LEN:number = 26;

    constructor() {super();}

    public static keys( len:number = 13 ):peerKeyStr{
        let permute:Array<peerKey> = [], tmp:peerKey,
            modulo:string, pbk:string ="", pvk:string ="";
        /***
         * Gen CIPHER
         */
        for(let i =0; i < len; i++ )permute.push(LCrypt.genKey(LCrypt3C.PERMUTE_LEN));
        /**
         * packString
         */
        for(let i=0; i < len; i++ ){
            // mod
            tmp = permute[i];
            modulo = DWORD.from(tmp.mod).toString();
            pbk += modulo;
            pvk += modulo;
            for( let j=0; j < tmp.pbk.length; j++ ){
                pbk += DWORD.from(tmp.pbk[j]).toString();
                pvk += DWORD.from(tmp.pvk[j]).toString();
            }
        }
        return {
            pbk: Buffer.from( Byte.from(len).toString()+ pbk,"utf-8").toString("base64"),
            pvk: Buffer.from( Byte.from(len).toString()+ pvk, "utf-8").toString("base64")
        }
    }

    /***
     * @unpackPassphrase: return a array of number x >= 0 && x <= 25
     * this array will be define permute table.
     *
     * @param passphrase
     */
    private static unpackPassphrase( passphrase:string ):number[]{
        return passphrase
            .toLowerCase()
            .split("")
            .map(value=>Math.abs(value.charCodeAt(0) - 0x61 )&0x1F )
    }

    public static deflateKey( key:Buffer, passphrase:string ):Array<LCryptKey>{
        let pass:Array<number>, tables:Array<LCryptKey> = Array(),
            tmp:number[], len:Byte= Byte.from(key.readUInt8(0)),
            keyStruct:defKeys, permute:Array<defKeys> = [];

        pass = passphrase
            .toLowerCase()
            .split("")
            .map(value=>Math.abs(value.charCodeAt(0) - 0x61 )&0x1F );

        for(let i=0, offset =1; i < len.valueOf(); i++ ){
            try {
                keyStruct = <defKeys>Struct.buffer2Struct(key.toString(), sDefKeys(), offset);
                offset += Struct.sizeOf(sDefKeys());
                permute.push(keyStruct);
            }catch (e) {
                throw new RuntimeException(`Your key is corrupted : ${e.stackTrace}`)
            }
        }
        // Get Table
        for(let i=0; i < len.valueOf(); i++ ){
            tmp = Array();
            for(let j = 0; j < 13; j++ ) tmp.push(  permute[i].key.get(pass[j]).valueOf() );
            tables.push({
                mod: permute[i].modulo.valueOf(),
                key: tmp
            });
        }
        return tables;
    }
    /****
     * By default String & string javascript type are in utf-8
     * Binary data  : Buffer( buff ).toString("binary") ; \xFF => UTF8( 80c3 )
     * UTF-8        : Buffer( buff ).toString()
     * @param buffer
     * @param key
     * @param encoding
     */
    protected static encryptDataA( buffer:string, key:Array<LCryptKey>, encoding:BufferEncoding ):string{
        let i:number = 0, out:number = 0, cipher:string= "", tmp:string;

        while ( ( tmp = buffer[i] ) ){
            out = Buffer.from(tmp,"binary").readUInt8();
            for(let j =0; j < key.length; j++) out = ( out * key[i%key.length].key[j] ) % key[i%key.length].mod;
            cipher +=WORD.from(out).toString();
            i++;
        }
        return Buffer.from(cipher).toString(encoding);
    }

    public static encryptData( buffer:string, keyBuffer:Buffer, passphrase:string, encoding:BufferEncoding ):string{
        return LCrypt3C.encryptDataA(buffer,LCrypt3C.deflateKey(keyBuffer, passphrase), encoding);
    }

    protected static decryptDataA(buffer:string, key:Array<LCryptKey>  ):string {
        let i:number = 0,kv:number=0, out:number = 0, cipher:string= "", tmp:string;

        while ( ( tmp = buffer[i] ) ){
            out = Buffer.from(tmp,"binary").toString("binary").charCodeAt(0) << 8 | Buffer.from(buffer[i+1],"binary").toString("binary").charCodeAt(0);
            for(let j =0; j < key.length; j++) out = ( out * key[kv%key.length].key[j] ) % key[kv%key.length].mod;
            cipher += String.fromCharCode(out);
            i+=2;
            kv++;
        }
        return Buffer.from(cipher).toString();
    }

    public static decryptData(buffer:string, keyBuffer:Buffer, passphrase:string ):string {
        return LCrypt3C.decryptDataA(buffer,LCrypt3C.deflateKey(keyBuffer, passphrase));
    }
}