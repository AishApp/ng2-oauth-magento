export interface IMagentoOptions {
    baseUrl?: String;
    consumerKey?: String;
    consumetSecretKey?: String;
}
export declare class CordovaOauthMagento {
    magentoOptions: IMagentoOptions;
    private oauthObject;
    private http;
    constructor(options?: IMagentoOptions);
    login(): any;
}
