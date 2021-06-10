
console.log(Buffer.from("\xC0","binary").toString("utf-8").charCodeAt(0))
console.log(Buffer.from(Buffer.from("\xC0","binary").toString("utf-8")).readUInt8())

let test:string = "\xc0";
console.log(Buffer.from(test,"binary").readUInt8())
console.log("\xc0","\xC0".charCodeAt(0),"À".charCodeAt(0))


