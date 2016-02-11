# ng2-oauth-magento
ng2-oauth-magento is a Angular2 library that helps in establishing connection to magento with oauth. 

### Requirements
* Apache Cordova 3.5+
* Angular2
* [Apache Cordova InAppBrowser Plugin] (https://github.com/apache/cordova-plugin-inappbrowser.git)
* [Apache Cordova Whitelist Plugin] (https://github.com/apache/cordova-plugin-whitelist) 
* jsSHA 1.6.0 Secure Hash Library	

### Installing ng2-oauth-magento
```
npm install --save ng2-oauth-magento
```
### Using ng2-oauth-magento

```javascript
import {CordovaOauthMagento} from 'ng2-oauth-magento/core';

this.oauthMagento = new CordovaOauthMagento({baseUrl: yourbaseURL, consumerKey: yourconsumerKey, consumerSecretKey: yourconsumerSecretKey});
        this.oauthMagento.connect().then((success) => {
            console.log("Success",JSON.stringify(success));
        }, (error) => {
            console.log("Error",error);
        });
```
This library will **NOT** work with a web browser, ionic serve, or ionic view.  It **WILL WORK** by installing either in device or in simulator.
