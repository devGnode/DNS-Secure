import {DnsSecure} from "./Test2";

export class Main {

    public static async main( argc:number, argv: string[] ):Promise<void>{
        //
        await DnsSecure
            .getInstance()
            .init();
    }

}