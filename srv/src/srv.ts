import {LCryptO} from "./LCrypt/LCryptO";
import {DNS_HEADER, FS_DNS_H} from "./DnsStruct";
import {DWORD} from "struct/lib/Dword";
import {WORD} from "struct/lib/Word";
import {Char, CString, Pointer} from "struct/lib/Pointer";
import {Byte} from "struct/lib/Byte";
import {Struct} from "struct/lib/Struct";
import {DnsSocket} from "../../src/DnsSocket";
import {recv} from "./DnsSocket";
import {pvoidStruct} from "struct/lib/Globals";
import {Logger} from "logger20js-ts/src/Logger";


const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    //  console.log(`[+] server error:\n${err.stack} ...`);
    server.close();
});


export type SECURE_DNS_USER = {
    id:         WORD,
    uid:        DWORD,
    len:        WORD,
    payload:    CString
} & pvoidStruct;

export let FS_SECURE_DNS_USER:Function = ():SECURE_DNS_USER=>{
    return {
        id:         WORD.from(),    // FRAME ID
        uid:        DWORD.from(),   // uid
        len:        WORD.from(),
        payload:    CString.from(null, Pointer.from(null,"len"))  // payload
    };
};

Logger.setPropertiesFile(process.cwd()+"/config/config.properties",false);
let logger:Logger = Logger.factory("DnsSecureServer");

server.on('message', async (msg:Buffer, rinfo) => {
    let crypto:LCryptO = LCryptO.from(Buffer.from("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","base64"),"wHux8SAvRzW08CDxeM2JJAye");
    let host:string, h:string ="", client:SECURE_DNS_USER = FS_SECURE_DNS_USER(),
    cipher:string;

    /****
     * NEW CLIENT : ASKING UNPACK
     */
    client = <SECURE_DNS_USER>Struct.buffer2Struct(msg.toString("binary"), client);

    logger.debug(`New Frame entering : ${Buffer.from(msg).toString("hex")}`);
    logger.info(`New Client : [ 0x%s ] `, client.uid.toHex().colorize().yellow);
    logger.debug(`Payload encrypted : ${Buffer.from(client.payload).toString("hex")}`);

    host = crypto.decrypt(Buffer.from(client.payload,"binary").toString("binary"));
    logger.info(`Client [ 0x%s ] has been asking : %s`, client.uid.toHex().colorize().yellow, host );
    //console.log("cipher struct ", Buffer.from(client.payload).toString("hex") )

    //if( !Char.from(host[0]).valueOf().equals(<any>255) ) console.log() // error BAD READING HOST
    host.split(".").map(value=>{h += Byte.from(value.length).toString() + value;});

    let dns: DNS_HEADER = FS_DNS_H(), dnsBufferQuery:Buffer,
        clientDns:DnsSocket, response:recv;

    // @ts-ignore
    dns.id          = WORD.rand();
    dns.flags       = WORD.from(0x0100);
    dns.Qdcount     = WORD.from(1);
    dns.Ancount     = dns.Nscount = dns.Arcount = WORD.from(0);
    dns.query       = CString.from(h,h.length+1);
    dns.type        = dns.class = WORD.from(1);
   // console.log(Struct.struct2Buffer(dns, FS_DNS_H()).toString());

    clientDns = new DnsSocket();
    response = await ( clientDns.sendWaitRecv(dnsBufferQuery = Struct.struct2Buffer(dns, FS_DNS_H()),53,"172.31.1.253"));

    // if response is null Timeout 15 seconde

    let dnsResp: DNS_HEADER = FS_DNS_H();
    // cast s_bits to WORD value,
    // better for manage it
    dnsResp.flags = WORD.from();
    Struct.buffer2Struct(response.message.toString("binary"), dnsResp);

    if( dnsResp.id.valueOf() !== dns.id.valueOf() ) logger.error(
        `Malformed reply : Query id( 0x%s ) : Response id( 0x%s ) : for user : [ 0x%s] `,
        dns.id.toHex().colorize().red,
        dnsResp.id.toHex().colorize().red,
        client.uid.toHex().colorize().blue
    );// Response Error Bad REQUEST

    logger.info(`DNS reply for : [ 0x%s ] : id : [ 0x%s ]`,  client.uid.toHex().colorize().yellow, dnsResp.id.toHex().colorize().yellow);
    // encrypt reforward
    cipher = crypto.encrypt(
        response
            .message
            .slice(dnsBufferQuery.toString().length)
            .toString("binary")
    );
    /*console.log("sliding", response
        .message
        .slice(dnsBufferQuery.toString().length).toString("hex"))*/
    //console.log("id 0x"+ dns.id.toHex(), dnsResp.flags.toHex(), dnsResp.Ancount, dnsResp.Nscount, dnsResp.Arcount );

    //let frame:string = ""
    await server.send(Buffer.from("\x1F\x2F"+cipher), rinfo.port, rinfo.address);
    clientDns.close();

});

server.on('listening', () => {
    let address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(56,"172.31.1.100");