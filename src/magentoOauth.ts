import { OauthUtility } from "./utility";
import {Http,HTTP_PROVIDERS,Headers} from 'angular2/http';
import {Injector} from "angular2/core";
import 'rxjs/add/operator/map';

declare var window:any;
declare var jsSHA:any;

export interface IMagentoOptions {
    baseUrl?:String;
    consumerKey?: String;
    consumerSecretKey?:String;
}

export class CordovaOauthMagento {

    magentoOptions:IMagentoOptions;

    private oauthObject;
    private http;


    constructor(options:IMagentoOptions = {}) {

        var injector = Injector.resolveAndCreate([HTTP_PROVIDERS]);
        this.http = injector.get(Http);

        if (!options.baseUrl || options.baseUrl == "") {
            throw Error("Base URL must exist");
        }
        if (!options.consumerKey || options.consumerKey == "") {
            throw Error("client id must exist");
        }
        if (!options.consumerSecretKey || options.consumerSecretKey == "") {
            throw Error("client secret must exist");
        }
        this.magentoOptions = options;


        if (typeof jsSHA !== "undefined") {
            this.oauthObject = {
                oauth_callback: "http://localhost/callback",
                oauth_consumer_key: this.magentoOptions.consumerKey,
                oauth_nonce: (new OauthUtility()).createNonce(5),
                oauth_signature_method: "HMAC-SHA1",
                oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
                oauth_version: "1.0"
            };
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (window.cordova) {
                if (window.cordova.InAppBrowser) {
                    //Login Module Begins
                    if (typeof jsSHA !== "undefined") {
                        var signatureObj = (new OauthUtility()).createSignature("POST", this.magentoOptions.baseUrl + "/oauth/initiate", this.oauthObject, {oauth_callback: "http://localhost/callback"}, this.magentoOptions.consumerSecretKey, null);
                        let headersInitiate = new Headers();
                        headersInitiate.append('Authorization', signatureObj.authorization_header);
                        headersInitiate.append('Content-Type', 'application/x-www-form-urlencoded');
                        let url = this.magentoOptions.baseUrl + "/oauth/initiate";
                        let callback = "oauth_callback=http://localhost/callback";
                        let initiate = this.http.post(url, JSON.stringify(callback), {headers: headersInitiate});
                        return initiate
                            .map(requestTokenResult => {
                                var mydata = {};
                                var requestTokenParameters = (requestTokenResult.text()).split("&");
                                var parameterMap = {oauth_token: "", oauth_token_secret: ""};

                                for (var i = 0; i < requestTokenParameters.length; i++) {
                                    parameterMap[requestTokenParameters[i].split("=")[0]] = requestTokenParameters[i].split("=")[1];
                                }
                                if (parameterMap.hasOwnProperty("oauth_token") === false) {
                                    reject("Oauth request token was not received");
                                }
                                var tokenSecret = parameterMap.oauth_token_secret;
                                var browserRef = window.cordova.InAppBrowser.open(this.magentoOptions.baseUrl + '/oauth/authorize?oauth_token=' + parameterMap.oauth_token, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                                browserRef.addEventListener("loadstart", (event) => {
                                    if ((event.url).indexOf("http://localhost/callback") === 0) {
                                        var callbackResponse = (event.url).split("?")[1];
                                        var responseParameters = (callbackResponse).split("&");
                                        var parameterMap = {oauth_token: "", oauth_verifier: ""};

                                        for (var i = 0; i < responseParameters.length; i++) {
                                            parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                                        }
                                        if (parameterMap.hasOwnProperty("oauth_verifier") === false) {
                                            reject("Browser authentication failed to complete.  No oauth_verifier was returned");
                                        }
                                        delete this.oauthObject.oauth_signature;
                                        delete this.oauthObject.oauth_callback;
                                        this.oauthObject.oauth_token = parameterMap.oauth_token;
                                        this.oauthObject.oauth_nonce = (new OauthUtility()).createNonce(5);
                                        this.oauthObject.oauth_verifier = parameterMap.oauth_verifier;
                                        var signatureObj1 = (new OauthUtility()).createSignature("POST", this.magentoOptions.baseUrl + "/oauth/token", this.oauthObject, {oauth_consumer_key: this.magentoOptions.consumerKey}, this.magentoOptions.consumerSecretKey, tokenSecret);
                                        var headerToken = new Headers();
                                        headerToken.append('Authorization', signatureObj1.authorization_header);
                                        headerToken.append('Content-Type', 'application/x-www-form-urlencoded');
                                        let url2 = this.magentoOptions.baseUrl + "/oauth/token";
                                        let key = "oauth_consumer_key: " + this.magentoOptions.consumerKey;
                                        let token = this.http.post(url2, JSON.stringify(key), {headers: headerToken});
                                        return token.map(
                                            result => {
                                                browserRef.close();
                                                var accessTokenParameters = (result.text()).split("&");
                                                var parameterMap = {};
                                                for (var i = 0; i < accessTokenParameters.length; i++) {
                                                    parameterMap[accessTokenParameters[i].split("=")[0]] = accessTokenParameters[i].split("=")[1];
                                                }

                                                if (parameterMap.hasOwnProperty("oauth_token_secret") === false) {
                                                    reject("Oauth access token was not received");
                                                }
                                                resolve(parameterMap);
                                            }).subscribe(
                                            data => {},
                                            err => {console.log(err);reject("Error on receiving token")},
                                            () => {}
                                        );
                                    }
                                });
                                /*browserRef.addEventListener("exit", (event) => {
                                    console.log("Exiting the app browser with data");
                                    //throw Error("Sign in flow was canceled");
                                });*/
                            }).subscribe(
                                () => {}
                            );
                    }
                    //Login Module Ends
                } else {
                    reject("The Apache Cordova InAppBrowser plugin was not found and is required");
                }
            }
            else {
                reject("Cannot authenticate via a web browser");
            }
        });
    }
}