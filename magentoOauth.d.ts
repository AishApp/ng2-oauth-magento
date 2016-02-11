export interface IMagentoOptions {
    baseUrl?: String;
    consumerKey?: String;
    consumerSecretKey?: String;
}
export declare class CordovaOauthMagento {
    magentoOptions: IMagentoOptions;
    private oauthObject;
    private http;
    constructor(options?: IMagentoOptions);
    connect(): Promise<{}>;
}
