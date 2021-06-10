import {Properties} from "lib-utils-ts/src/file/Properties";
import {List} from "lib-utils-ts/src/Interface";


export class PropertiesConfig extends Properties{

    private static readonly INSTANCE: PropertiesConfig = new PropertiesConfig();

    private blackList: List<RegExp>;

    constructor() {
        super();
        super.load(PropertiesConfig.class().getResourcesAsStream(process.cwd()+"/config/config.properties"));
        this.loadBlackListRegExp();

    }

    private loadBlackListRegExp():void{
        if(!String(this.getProperty("dns.blacklist.path", "")).length.equals(0)){
            let path:string = String(this.getProperty("dns.blacklist.path"));

            // check absolute path
            if( !path.exec(/^([A-Z]{1}\:\/)/) )path = process.cwd() +"/"+ path;
            this.blackList =
                PropertiesConfig
                .class()
                .getResourcesAsStream(path)
                .getLines()
                .stream()
                .mapTo<RegExp>(regString=>new RegExp(`${regString}`))
                .getList();
        }
    }

    public getAddress():string{return String(this.getProperty("server.address","127.0.0.1"));}

    public getUdpVersion():string{ return String(this.getProperty("proto.udp.version","4")); }

    public getBlackListRegExp():List<RegExp>{ return this.blackList; }

    public static getInstance():PropertiesConfig{return PropertiesConfig.INSTANCE;}

}