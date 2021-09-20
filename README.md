# InAppBrowser Sample
Uses Capacitor 3 with Cordova In App Browser and shows:

1. How to use the `beforeload` event to selectively choose what to do when navigating to a URL (search for `[SystemBrowser]`)
2. When a PDF file is clicked the PDF is viewed with cordova-document-viewer and can be printed (see `download` method)
3. Demonstrates intercepting route changes on a SPA application that is displaying in the in-app browser (see `executeScript` method)
4. Demonstrates how to modify dom elements on the displayed page in in-app browser (see `fixLinks` method)
5. Has a slightly modified version of the cordova-plugin-inappbrowser which is included in the repo which fixes an bug with the `beforeload` event

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

See the `fixLinks` method which can be used with `executescript` to avoid this problem on Android.

### About _System
When this is called:
```typescript
window.open(event.url, '_system', 'location=yes');
```
In Android this is effectively launching a download in the Android operating systems browser of choice. This may open the PDF if the flavor of Android has a PDF viewer. On iOS it will display the built in PDF viewer. This is why an embedded PDF Viewer sample is included.

## Note on Android
There is an outstanding problem in the chromium webview that cannot intercept POST calls hence beforeload is not fired:
https://bugs.chromium.org/p/chromium/issues/detail?id=155250#c39

## About Links
The `beforeload` event will work with https links. http links are flagged as insecure on Android.
Deep links such as mailto:// fb:/// twitter:// tel:// are not captured and result in `Possible Uncaught/Unknown URI` error

Urls other than https could be launched in your app via `window.open(url..` but these will error with:
`Failed to open URL [url here]: Error Domain=NSOSStatusErrorDomain Code=-10814 "(null)" UserInfo={_LSLine=229, _LSFunction=-[_LSDOpenClient openURL:options:completionHandler:]}`

## About Authentication
Launching from the app to either the inAppBrowser or system browser does not copy across any notion of cookies or authentication. It is a simple launch of a url, so if authentication is required it must be part of the url.

An alternative is to have your application process urls: eg for a PDF link, have the application load the URL in an iFrame and use a PDF viewer web application, or use a component to display the PDF as in the sample.

## SetCookie
The plugin contains a new API called SetCookie which allows you to programmatically set a cookie in the in-app browsers current page.

```Typescript
setCookie(url: string, cookieString: string, callback?: any, error?: any): void
```

## Plugin Bugs
There is a pull request ([PR 755](https://github.com/apache/cordova-plugin-inappbrowser/pull/755)) that has not been merged into the official plugin (as of 9/17/2021) but it has been included in the local copy of the plugin in this repo. It ensures that `beforeload` event is triggered every time.

There is a bug in iOS where the view will not rotate and display in landscape mode. This has been fixed in this local copy of the plugin. Details about the fix are [here](https://github.com/apache/cordova-plugin-inappbrowser/issues/773).

## Tracking Page Changes
SPA applications do not reload the page when their router changes the page, so `beforeload` etc will not fire. Most SPA applications will change the url of the browser and we can track that using a `setInterval` function and comparing `location.href` to last time. If it has changed then we can fire the `postMessage` function to send the message back to our app. Take a look at `home.page.ts` for an example.

Note: There are [`hashChange`](https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event) events that can detect if the hash in a url changes and the [`popState`](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event) event will detect if the browser history changes but these wont fire on a SPA application that doesnt use a hash location strategy or alter the browser history.
