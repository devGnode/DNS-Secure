import * as dgram from "dgram"
import {RemoteInfo, Socket} from "dgram";
import {PropertiesConfig} from "./PropertiesConfig";
import { Define } from "lib-utils-ts/src/Define";
import {Logger} from "logger20js-ts/src/Logger";

export interface recv{
    message:Buffer,
    remote:RemoteInfo
}

export class DnsSocket {
    /***
     * Logger
     */
    private static readonly logger:Logger = Logger.factory(DnsSocket.name);

    protected static UDP_PROTO_VERSION:string = "udp4";

    private readonly server:Socket;
    private prop:PropertiesConfig       = PropertiesConfig.getInstance();
    private err:Error;

    constructor( ) {this.server = dgram.createSocket({type:"udp4",reuseAddr:true});}

    public getServer():Socket{return this.server;}

    public async sendWaitRecv( message:Buffer, port:number, to:string = "0.0.0.0", timeout:number = 20000 ):Promise<recv>{
        Object.requireNotNull(message,"Buffer argument can be null !");
        Object.requireNotNull(port,"Port argument can be null !");
        return new Promise<recv>(resolve => {
            let validate:boolean = false, hasFailed:Boolean= false;
            this.server.send(message, 0, message.length, port, to, (error:Error) => {
                this.err = error;
                if(error)resolve(null);
            });
            this.server.on('message',  (message:Buffer, remote:RemoteInfo)=> {
                if(!Define.of(hasFailed).isNull())resolve({message, remote});
            });
            setTimeout(()=>!validate? resolve(hasFailed=null) : void 0, timeout);
        });
    }

    public message( callback:Function ):DnsSocket{
        this.server.on('message',  (message:Buffer, remote:RemoteInfo)=> {
            callback.call(this, message, remote);
        });
        return this;
    }

    public async send( message:Buffer, port:number, host:string = '0.0.0.0' ):Promise<void>{
        return new Promise<void>(resolve => {
            this.server.send(message, 0, message.toString("hex").length / 2, port, host, () => {
                resolve();
            });
        });
    }

    public error( callback: (error:Error, server: Socket)=>void ):DnsSocket{
        this.server.on('error',(error:Error)=>{
            this.err = error;
            callback.call(this, (this.err =  error), this.server);
            this.server.close();
        });
        return this;
    }

    public listening( callback?: (error:any)=>void ):Boolean{
        /***
         *
         */
        this.server.on('listening', () => {
            if (!Define.of(callback).isNull()) callback.call(this);
        });
        return true
    }

    public async bind( port:number, address:string = null ):Promise<Boolean>{
        return new Promise<Boolean>( (resolve)=> {
            /****
             * Listen on port 53, default DNS port
             */
            let state:boolean=true;
            this.server.bind(port, Define.of(address).orNull(this.prop.getAddress()), () => {
                if(this.getLastError()) state=false;
                resolve(state);
            });
        });
    }

    public close():void{this.server.close();}

    public getLastError():Error{return this.err;}

    public getLogger( ):Logger{ return DnsSocket.logger; }
}