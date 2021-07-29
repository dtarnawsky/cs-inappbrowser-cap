# Sample Project
Uses Capacitor 3 with Cordova In App Browser and shows how to use the beforeload event.

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

## Note on Android
Outstanding problem in the chromium webview that cannot intercept POST calls fore beforeload:
https://bugs.chromium.org/p/chromium/issues/detail?id=155250#c39


