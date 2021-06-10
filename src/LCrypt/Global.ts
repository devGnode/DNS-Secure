import {DWORD} from "struct/lib/Dword";
import {DwordArray} from "struct/lib/ArrayL";
import {pvoidStruct} from "struct/lib/Globals";

export interface LCryptKey{
    key:number[],   // DWORD[]
    mod:number      // DWORD
}

export interface peerKey {
    pbk:number[],   // DWORD[]
    pvk:number[],   // DWORD[]
    mod:number,     // WORD
    len:number      // BYTE
}

export interface peerKeyStr{
    pbk:string,
    pvk:string
}

export type defKeys = {
    modulo: DWORD,
    key:    DwordArray
} & pvoidStruct

export let sDefKeys:Function = ():defKeys=>{
    return {
        modulo: DWORD.from(),
        key:    DwordArray.inst(26)
    };
}

declare global {
    interface Number{
        isPrime( ):boolean
    }
}

Number.prototype.isPrime = function( ){
    let n:number = this.toFixed( ),
        sqrt:number,i:number;

    if( n == 2 ) return true;
    else if( n%2 === 0 || n < 2 ) return false;
    if( ( sqrt = Math.sqrt( n ) ) == parseInt( String(sqrt) ) ) return false;

    try{for( i = 3; i < sqrt; i+=2 ) if( n%i == 0 ) return false; }catch(e){
        return false;
    }
    return true;
};
