var OauthUtility = (function () {
    function OauthUtility() {
    }
    /*
     * Sign an Oauth 1.0 request
     *
     * @param    string method
     * @param    string endPoint
     * @param    object headerParameters
     * @param    object bodyParameters
     * @param    string consumerSecretKey
     * @param    string tokenSecretKey (optional)
     * @return   object
     */
    OauthUtility.prototype.createSignature = function (method, endPoint, headerParameters, bodyParameters, consumerSecretKey, tokenSecretKey) {
        if (typeof jsSHA !== "undefined") {
            var headerAndBodyParameters = Object.assign({}, headerParameters);
            var bodyParameterKeys = Object.keys(bodyParameters);
            for (var i = 0; i < bodyParameterKeys.length; i++) {
                headerAndBodyParameters[bodyParameterKeys[i]] = encodeURIComponent(bodyParameters[bodyParameterKeys[i]]);
            }
            var signatureBaseString = method + "&" + encodeURIComponent(endPoint) + "&";
            var headerAndBodyParameterKeys = (Object.keys(headerAndBodyParameters)).sort();
            for (i = 0; i < headerAndBodyParameterKeys.length; i++) {
                if (i == headerAndBodyParameterKeys.length - 1) {
                    signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]]);
                }
                else {
                    signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]] + "&");
                }
            }
            var oauthSignatureObject = new jsSHA(signatureBaseString, "TEXT");
            var encodedTokenSecret = '';
            if (tokenSecretKey != null) {
                encodedTokenSecret = encodeURIComponent(tokenSecretKey);
            }
            headerParameters.oauth_signature = encodeURIComponent(oauthSignatureObject.getHMAC(encodeURIComponent(consumerSecretKey) + "&" + encodedTokenSecret, "TEXT", "SHA-1", "B64"));
            var headerParameterKeys = Object.keys(headerParameters);
            var authorizationHeader = 'OAuth ';
            for (i = 0; i < headerParameterKeys.length; i++) {
                if (i == headerParameterKeys.length - 1) {
                    authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '"';
                }
                else {
                    authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '",';
                }
            }
            return { signature_base_string: signatureBaseString, authorization_header: authorizationHeader, signature: headerParameters.oauth_signature };
        }
        else {
            console.log("Error: Missing jsSHA JavaScript library");
            return { signature_base_string: null, authorization_header: null, signature: null };
        }
    };
    OauthUtility.prototype.createNonce = function (length) {
        var nonce = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            nonce += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return nonce;
    };
    return OauthUtility;
})();
exports.OauthUtility = OauthUtility;
