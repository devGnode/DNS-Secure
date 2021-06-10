import {WORD} from "struct/lib/Word";
import {pvoidStruct, s_bits} from "struct/lib/Globals";
import {CString, Pointer} from "struct/lib/Pointer";
import {Byte} from "struct/lib/Byte";
import {DWORD} from "struct/lib/Dword";
/***
 * PrototypeOf DNS_HEADER
 */
export type DNS_HEADER = {
    id      : WORD,
    flags   : s_bits|WORD,
    Qdcount : WORD,
    Ancount : WORD,
    Nscount : WORD,
    Arcount : WORD,
    query   : CString,
    type    : WORD,
    class   : WORD
} & pvoidStruct

export type DNS_NAME = {
    size    :   Byte,
    payload :   CString
} & pvoidStruct

export type DNS_RR ={
    name:       WORD,
    type:       WORD,
    class:      WORD,
    ttl:        DWORD,
    size:       WORD,
    payload:    CString
} & pvoidStruct;

export let FS_DNS_H:Function =():DNS_HEADER=>{
    return {
        id      :   WORD.from(),
        flags   :   { a:1, fc:4, dc:1, ed:1, e:1, y:1, aa:1, ag:1, nb:1, jk:4 },
        Qdcount :   WORD.from(),
        Ancount :   WORD.from(),
        Nscount :   WORD.from(),
        Arcount :   WORD.from(),
        query   :   CString.from(),
        type    :   WORD.from(),
        class   :   WORD.from()
    };
};

export let FS_DNS_RR:Function = ():DNS_RR=>{
  return {
      name:       WORD.from(),
      type:       WORD.from(),
      class:      WORD.from(),
      ttl:        DWORD.from(),
      size:       WORD.from(),
      payload:    CString.from(null,Pointer.from(null,"size"))

  }
};

export let FS_DNS_NAME:Function =():DNS_NAME=>{
    return {
        size    :   Byte.from(),
        payload :   CString.from(null, Pointer.from(null,"size"))
    };
};


export type FORWARD_SECURE_DNS = {
    len:WORD,
    payload: CString
}


export let FORWARD_SDNS:Function = ():FORWARD_SECURE_DNS=>{
    return{
      len:WORD.from(),
      payload: CString.from(null,Pointer.from(null,"len"))
    };
}