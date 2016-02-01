# ng2-oauth-magento
ng2-oauth-magento is a Angular2 library that helps in establishing connection to magento with oauth. 

### Requirements
* Apache Cordova 3.5+
* Angular2
* [Apache Cordova InAppBrowser Plugin] (http://cordova.apache.org/docs/en/3.0.0/cordova_inappbrowser_inappbrowser.md.html)
* [Apache Cordova Whitelist Plugin] (https://github.com/apache/cordova-plugin-whitelist) 
* jsSHA 1.6.0 Secure Hash Library	

### Installing ng2-oauth-magento
```
npm install ng2-oauth-magento --save
```
### Using ng2-oauth-magento

```javascript
import {CordovaOauthMagento} from 'ng2-oauth-magento/core';

this.oauthMagento = new CordovaOauthMagento({baseUrl: baseURL, consumerKey: consumerKey, consumetSecretKey: consumetSecretKey});
        this.oauthMagento.login().subscribe((result) => {
            console.log("Success",JSON.stringify(result));
        }, (error) => {
            console.log("Error",error);
        });
```
This library will **NOT** work with a web browser, ionic serve, or ionic view.  It **WILL WORK** by installing either in device or simulator.
