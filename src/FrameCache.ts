import {WORD} from "struct/lib/Word";
import {recv} from "./DnsSocket";

export class FrameCache {

    private readonly frame:string;
    private readonly date:Date;
    private counter:number = 0;

    constructor(frame:Buffer, count:number = 0) {
        this.frame = frame.toString('binary').substr(2);
        this.date  = new Date();
        this.counter = count;
    }

    public getFrame( id:WORD ):Buffer{ this.counter++; return Buffer.from( id.toString() + this.frame, 'binary'); }

    public toRecv( id:WORD ):recv{
        return {
            message: this.getFrame(id),
            remote: null
        };
    }

    public getCounter():number{ return this.counter; }

    public getDate():Date{ return this.date; }
}