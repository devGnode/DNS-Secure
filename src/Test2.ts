import {DnsSocket, recv} from "./DnsSocket";
import {Logger} from "logger20js-ts/src/Logger";
import {RemoteInfo} from "dgram";
import {DNS_HEADER, FS_DNS_H, FS_SECURE_DNS_USER, SECURE_DNS_USER} from "./DnsStruct";
import {Struct} from "struct/lib/Struct";
import {UtilsDns} from "./UtilsDns";
import {PropertiesConfig} from "./PropertiesConfig";
import {HashMap} from "lib-utils-ts/src/List";
import {FrameCache} from "./FrameCache";
import { OutputStreamWriter} from "lib-utils-ts/src/file/IOStream";
import {WORD} from "struct/lib/Word";
import {LCryptO} from "./LCrypt/LCryptO";
import {DWORD} from "struct/lib/Dword";
import {CString} from "struct/lib/Pointer";
import {Define} from "lib-utils-ts/src/Define";

Logger.setPropertiesFile(process.cwd()+"/config/config.properties",false);

export class DnsSecure{

    private static readonly INSTANCE:DnsSecure  = new DnsSecure();
    private static readonly logger:Logger       = Logger.factory(DnsSecure.name)

    private prop:PropertiesConfig               = PropertiesConfig.getInstance();
    private server:DnsSocket;
    private crypt:LCryptO;

    public cache:HashMap<string, FrameCache> = new HashMap({});

    constructor() {}

    private error(error:Error):void{DnsSecure.logger.error(error.message);}

    private listening():void{DnsSecure.logger.info('Server Listen on %s', this.server.getServer().address().address);}

    private async recv(message:Buffer, remote:RemoteInfo):Promise<void>{
        let client:DnsSocket = new DnsSocket(),
        // read Header
        header: DNS_HEADER, host:string;

        header = <DNS_HEADER>Struct.buffer2Struct(message.toString("binary"), FS_DNS_H());
        host = UtilsDns.unpackName(header.query.valueOf());

        // has BlackListed
        if( this.prop
            .getBlackListRegExp()
            .stream()
            .anyMatch(reg=>reg.test(host)) ){

            // no such name code
            header.flags =  WORD.from(0x8183);
            await this.server.send(Buffer.from(Struct.struct2Buffer(header,FS_DNS_H())), remote.port);
            DnsSecure.logger.warn(`Blocked url coming : ${host}`);
        }else {
            let k: recv;

           if( this.cache.get(host) ){
               DnsSecure.logger.info(`Cache replay Query : id( 0x%s ) for %s`, header.id.toHex().toUpperCase().colorize().yellow, host.colorize().blue);
               // check Query data corrspnd bien a la demande avant de reforward
               k = this.cache.get(host).toRecv(header.id);

           } else {

               DnsSecure.logger.info(`Query : id( 0x%s ) to %s`, header.id.toHex().toUpperCase().colorize().yellow, host.colorize().blue);
               //+header.class.toString()+header.type.toString()
               DnsSecure.logger.debug(`Payload encrypted : ${this.crypt.encrypt(host,"hex")}`);

               DWORD.from( parseInt( String(this.prop.getProperty("dns.dns.forward.id","FFFFFFFF")), 16) ).toString();
               // @ts-ignore
               WORD.rand();
               let Q:DnsSocket = new DnsSocket(),
                    clientFrame:SECURE_DNS_USER = FS_SECURE_DNS_USER(),
                    cipher:string = this.crypt.encrypt(host);

               clientFrame.id        = WORD.rand();
               clientFrame.uid       = DWORD.from(0x1f2f3f4f );
               clientFrame.len       = WORD.from(cipher.length);
               clientFrame.payload   = CString.from(cipher,cipher.length);

               let tmpp:recv = await (Q.sendWaitRecv(Buffer.from( Struct.struct2Buffer(clientFrame,FS_SECURE_DNS_USER()) ),56,"172.31.1.100"));
               if( Define.of(tmpp).isNull() ){
                   header.flags =  WORD.from(0x8183);
                   DnsSecure.logger.warn(`DNS no responding :172....`);
               }
               // let tmpp:recv = await (Q.sendWaitRecv(Buffer.from("\x1F\x2F"+this.crypt.encrypt(host)),56,"172.31.1.100"));

              //if(tmpp)console.log("recv = ffdfdfdfdfd", /*this.crypt.decrypt( */tmpp.message.toString("utf-8").substr(2), "/" )
              // console.log("stated", Buffer.from(this.crypt.decrypt(tmpp.message.toString().substr(2).toString())).toString("binary"))
               k = {remote:null,message:null};
               header.flags = WORD.from(0x8180);
               k.message = Struct.struct2Buffer(header,FS_DNS_H() ) // + Buffer.from(this.crypt.decrypt(tmpp.message.toString().substr(2).toString()),"binary") );

               //console.log( Struct.struct2Buffer(header,FS_DNS_H() ).toString("hex") +"\r\n"+ Buffer.from(this.crypt.decrypt(tmpp.message.toString().substr(2).toString()),"binary").toString("hex") );
               //console.log("Decrypt", Buffer.from(this.crypt.decrypt("³@")).toString("hex"))
              k = await client.sendWaitRecv(
                   Buffer.from(message),
                   Number(this.prop.getProperty("dns.forward.port")),
                   <string>this.prop.getProperty("dns.forward.host")
               );
           }
            await this.server.send(Buffer.from(k.message), remote.port);
            client.close();

            if( !this.cache.get(host) && this.cache.size() < Number(this.prop.getProperty("dns.cache.size")) ) this.cache.put(host,new FrameCache(k.message));

            //(new OutputStreamWriter("")).write("")
        }

    }

    /***
     * INIT SERVER HANDLER
     */
    public async init(){
        let dns: DnsSocket = new DnsSocket(),
            cypto: LCryptO = LCryptO.from(Buffer.from(String(this.prop.getProperty("dns.lCryptO.key")),"base64"),String(this.prop.getProperty("dns.LCryptO.passphrase")));

        this.crypt = cypto;
        this.server = dns;
        dns.error(this.error);
        dns.listening(()=>this.listening());
        dns.message(async (message:Buffer, remote:RemoteInfo)=>{
            await this.recv(message, remote);
        });
        if( await dns.bind(53, String(this.prop.getProperty("server.address"))  ) ) DnsSecure.logger.info("Bind to 53");

        // ENCRYPT DATA
        process.on('SIGINT', () => {
            let t:string = "";
            this.cache.stream().each((v:FrameCache,k:string)=>{
                t+=k+";"+v.getFrame(WORD.from(0xFFFF )).toString('base64')+";"+v.getCounter()+"\n"
            });
            new OutputStreamWriter(process.cwd()+"/cache/chache.dump").write(t, true);
            this.server.close();
        });

    }
    /***
     * INIT SERVER HANDLER
     */
    public static getInstance():DnsSecure{ return DnsSecure.INSTANCE; }
}


(async ()=>{

    await DnsSecure
        .getInstance()
        .init();

})();