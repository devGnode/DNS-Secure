import { DNS_NAME, FS_DNS_NAME} from "./DnsStruct";
import {Struct} from "struct/lib/Struct";
import {Types} from "struct/lib/Globals";

export abstract class UtilsDns {

    public static unpackName( value:string ):string{
        let out:Array<string> = [], s: DNS_NAME, offset:number =0;

        while( value[offset] ) {
            s = <DNS_NAME>Struct.buffer2Struct(value, FS_DNS_NAME(), offset);
            out.push( s.payload.valueOf() );
            offset += s.size.valueOf() + Types.BYTE;
        }
        return out.join(".");
    }

}