import { OauthUtility } from "./utility";
import {Http,HTTP_PROVIDERS,Headers} from 'angular2/http';
import {Injector} from "angular2/core";
import 'rxjs/add/operator/map';

declare var window:any;
declare var jsSHA:any;

export interface IMagentoOptions {
    baseUrl?:String;
    consumerKey?: String;
    consumetSecretKey?:String;
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
        if (!options.consumetSecretKey || options.consumetSecretKey == "") {
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

    login() {
        if (window.cordova) {
            if (window.cordova.InAppBrowser) {
                //Login Module Begins
                if (typeof jsSHA !== "undefined") {
                    debugger;
                    var signatureObj = (new OauthUtility()).createSignature("POST", this.magentoOptions.baseUrl + "/oauth/initiate", this.oauthObject, {oauth_callback: "http://localhost/callback"}, this.magentoOptions.consumetSecretKey, null);
                    let headersInitiate = new Headers();
                    headersInitiate.append('Authorization', signatureObj.authorization_header);
                    headersInitiate.append('Content-Type', 'application/x-www-form-urlencoded');
                    let url = this.magentoOptions.baseUrl + "/oauth/initiate";
                    let callback = "oauth_callback=http://localhost/callback";
                    let initiate = this.http.post(url, JSON.stringify(callback), {headers: headersInitiate});
                    return initiate.map(requestTokenResult => {
                        var requestTokenParameters = (requestTokenResult.text()).split("&");
                        var parameterMap = {oauth_token: "", oauth_token_secret: ""};

                        for (var i = 0; i < requestTokenParameters.length; i++) {
                            parameterMap[requestTokenParameters[i].split("=")[0]] = requestTokenParameters[i].split("=")[1];
                        }
                        if (parameterMap.hasOwnProperty("oauth_token") === false) {
                            throw Error("Oauth request token was not received");
                        }
                        var tokenSecret = parameterMap.oauth_token_secret;

                        var browserRef = window.cordova.InAppBrowser.open(this.magentoOptions.baseUrl + '/oauth/authorize?oauth_token=' + parameterMap.oauth_token, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function (event) {
                            if ((event.url).indexOf("http://localhost/callback") === 0) {
                                var callbackResponse = (event.url).split("?")[1];
                                var responseParameters = (callbackResponse).split("&");
                                var parameterMap = {oauth_token: "", oauth_verifier: ""};

                                for (var i = 0; i < responseParameters.length; i++) {
                                    parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                                }
                                if (parameterMap.hasOwnProperty("oauth_verifier") === false) {
                                    throw Error("Browser authentication failed to complete.  No oauth_verifier was returned");
                                }
                                delete this.oauthObject.oauth_signature;
                                delete this.oauthObject.oauth_callback;
                                this.oauthObject.oauth_token = parameterMap.oauth_token;
                                this.oauthObject.oauth_nonce = (new OauthUtility()).createNonce(5);
                                this.oauthObject.oauth_verifier = parameterMap.oauth_verifier;
                                var signatureObj = (new OauthUtility()).createSignature("POST", this.magentoOptions.baseUrl + "/oauth/token", this.oauthObject, {}, this.magentoOptions.consumetSecretKey, tokenSecret);
                                var headerToken = new Headers();
                                headerToken.append('Authorization', signatureObj.authorization_header);
                                headerToken.append('Content-Type', 'application/x-www-form-urlencoded');
                                this.http.post(this.magentoOptions.baseUrl + "/oauth/token")
                                    .map(
                                        result => {
                                            var accessTokenParameters = result.split("&");
                                            var parameterMap = {};
                                            for (var i = 0; i < accessTokenParameters.length; i++) {
                                                parameterMap[accessTokenParameters[i].split("=")[0]] = accessTokenParameters[i].split("=")[1];
                                            }

                                            if (parameterMap.hasOwnProperty("oauth_token_secret") === false) {
                                                throw Error("Oauth access token was not received");
                                            }

                                            return (parameterMap);
                                        });

                            }
                        });
                        browserRef.addEventListener("exit", function (event) {
                            throw Error("Sign in flow was canceled");
                        });
                    });
                }
                //Login Module Ends
            } else {
                return ("The Apache Cordova InAppBrowser plugin was not found and is required");
            }
        }
        else {
            return ("Cannot authenticate via a web browser");
        }
    }
}