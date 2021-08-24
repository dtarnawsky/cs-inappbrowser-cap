# InAppBrowser Sample
Uses Capacitor 3 with Cordova In App Browser and shows how to use the beforeload event. When links to PDF files are clicked the app will launch the system web browser to display the PDF.

## About BeforeLoad
The `beforeload` event is configured by specifying `beforeload=yes` in the options of `InAppBrowser`:
```typescript
this.browser = this.iab.create('https://cs-links.netlify.app/', '_blank', 'location=no,beforeload=yes');
```

Now we can decide what to do when the user clicks a link in the InAppBrowser by:
```typescript
    this.browser.on('beforeload').subscribe((event: InAppBrowserEvent) => {
      if (event.url.toLowerCase().endsWith(".pdf")) {
        window.open(event.url, '_system', 'location=yes');
        return;
      }

      this.browser._loadAfterBeforeload(event.url);
    });
```

In the code above if the user clicks a link to a url which ends with `.pdf` then the app will launch the systems web browser rather than open the link in the in app browser.

### Quirks
For iOS beforeload will fire with:
```html
<a href="https://domain/blar.pdf">Link</a>
<a target="_blank" href="https://domain/blar.pdf">Link</a>
<a target="_system_" href="https://domain/blar.pdf">Link</a>
```

For Android beforeload will fire with:
```html
<a href="https://domain/blar.pdf">Link</a>
```

But, it will not fire when the target is specified:
```html
<a target="_blank" href="https://domain/blar.pdf">Link</a>
<a target="_system_" href="https://domain/blar.pdf">Link</a>
```

### About _System
When this is called:
```typescript
window.open(event.url, '_system', 'location=yes');
```
In Android this is effectively launching a download in the Android operating systems browser of choice. This may open the PDF. It also may not depending on the flavor of Android and configuration.

In iOS this launches iOS pdf viewer.

## Note on Android
There is an outstanding problem in the chromium webview that cannot intercept POST calls hence beforeload is not fired:
https://bugs.chromium.org/p/chromium/issues/detail?id=155250#c39

## About Links
The beforeload event will work with https links. http links are flagged as insecure on Android.
Deep links such as mailto:// fb:/// twitter:// tel:// are not captured and result in Possible Uncaught/Unknown URI error

Urls other than https could be launched in your app via `window.open(url..` but these will error with:
`Failed to open URL [url here]: Error Domain=NSOSStatusErrorDomain Code=-10814 "(null)" UserInfo={_LSLine=229, _LSFunction=-[_LSDOpenClient openURL:options:completionHandler:]}`

## About Authentication
Launching from the app to either the inAppBrowser or system browser does not copy across any notion of cookies or authentication. It is a simple launch of a url, so if authentication is required it must be part of the url.

An alternative is to have your application process urls: eg for a PDF link, have the application load the URL in an iFrame and use a PDF viewer web application, or use a component to display the PDF.


## Testing PR 755
Android - Go to components then support page

### Before PR 755
onscript loading complete
main.d605ccb3bb52d6756457.js:1 Ionic Native: deviceready event fired after 231 ms
3952.0790146f43b282a52906.js:1 loadstart {"type":"loadstart","url":"https://cs-links.netlify.app/"}
VM3:228 native App.addListener (#37842630)
3952.0790146f43b282a52906.js:1 loadstop {"type":"loadstop","url":"https://cs-links.netlify.app/tabs/tab1"}
3952.0790146f43b282a52906.js:1 beforeload {"type":"beforeload","url":"https://ionicframework.com/docs/components","method":"GET"}
3952.0790146f43b282a52906.js:1 loadstart {"type":"loadstart","url":"https://ionicframework.com/docs/components"}
3952.0790146f43b282a52906.js:1 loadstop {"type":"loadstop","url":"https://ionicframework.com/docs/components"}
3952.0790146f43b282a52906.js:1 loadstart {"type":"loadstart","url":"https://ionic.io/support"}
33952.0790146f43b282a52906.js:1 loadstop {"type":"loadstop","url":"https://ionic.io/support"}

### After PR 755
onscript loading complete
main.1fe94490a69a0d9f1e8c.js:1 Ionic Native: deviceready event fired after 662 ms
VM3:231 native App.addListener (#84396432)
3952.0790146f43b282a52906.js:1 loadstart {"type":"loadstart","url":"https://cs-links.netlify.app/"}
3952.0790146f43b282a52906.js:1 loadstop {"type":"loadstop","url":"https://cs-links.netlify.app/tabs/tab1"}
3952.0790146f43b282a52906.js:1 beforeload {"type":"beforeload","url":"https://ionicframework.com/docs/components","method":"GET"}
3952.0790146f43b282a52906.js:1 loadstart {"type":"loadstart","url":"https://ionicframework.com/docs/components"}
3952.0790146f43b282a52906.js:1 loadstop {"type":"loadstop","url":"https://ionicframework.com/docs/components"}
3952.0790146f43b282a52906.js:1 beforeload {"type":"beforeload","url":"https://ionic.io/support","method":"GET"}
3952.0790146f43b282a52906.js:1 loadstop {"type":"loadstop","url":"https://ionic.io/support"}
3952.0790146f43b282a52906.js:1 loadstart {"type":"loadstart","url":"https://ionic.io/support"}
33952.0790146f43b282a52906.js:1 loadstop {"type":"loadstop","url":"https://ionic.io/support"}