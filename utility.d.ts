export declare class OauthUtility {
    createSignature(method: any, endPoint: any, headerParameters: any, bodyParameters: any, consumerSecretKey: any, tokenSecretKey: any): {
        signature_base_string: string;
        authorization_header: string;
        signature: any;
    };
    createNonce(length: Number): any;
}
