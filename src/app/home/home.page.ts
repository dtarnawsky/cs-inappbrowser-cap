import { Component } from '@angular/core';
import { InAppBrowser, InAppBrowserEvent, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private browser: InAppBrowserObject;
  constructor(private iab: InAppBrowser, private platform: Platform) {
    platform.ready().then(() => {
      this.open();
    });
  }

  public open() {
    this.browser = this.iab.create('https://cs-links.netlify.app/', '_blank', 'location=no,beforeload=yes');

    this.browser.on('loadstop').subscribe((event: InAppBrowserEvent) => {
      // Fires on iOS
      // Fires on Android
      console.log('loadstop', event);
    });
    this.browser.on('loadstart').subscribe((event: InAppBrowserEvent) => {
      // Fires on iOS
      // Fires on Android
      console.log('loadstart', event);
    });
    this.browser.on('loaderror').subscribe((event: InAppBrowserEvent) => {
      console.log('loaderror', event);
    });

    this.browser.on('beforeload').subscribe((event: InAppBrowserEvent) => {
      // Fires on iOS
      // Does not fire on Android on startup of first browser load but does fire afterwards
      console.log(`beforeload ${event.url}`);
      console.log(JSON.stringify(event));

      if (event.url.toLowerCase().endsWith(".pdf")) {
        // We want to launch this in the system browser instead of from InAppBrowser
        console.log(`Opening ${event.url} in system browser`);
        window.open(event.url, '_system', 'location=yes');
        return;
      }

      if (!event.url.startsWith("https://")) {
        // Avoid urls other than https
        console.log(`Unsupported url ${event.url}`);
        return;
      }

      // Callback to ensure it loads
      this.browser._loadAfterBeforeload(event.url);
    });
    this.browser.on('message').subscribe((event: InAppBrowserEvent) => {
      console.log('message', event);
    });
  }
}
