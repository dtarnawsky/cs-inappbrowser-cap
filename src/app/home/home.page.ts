import { Component } from '@angular/core';
import { InAppBrowser, InAppBrowserEvent, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private browser: InAppBrowserObject;
  constructor(private iab: InAppBrowser) { }

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

      if (event.url.toLowerCase().endsWith(".pdf")) {
        // We want to launch this in the system browser instead of from InAppBrowser
        console.log(`Opening ${event.url} in system browser`);
        window.open(event.url, '_system', 'location=yes');
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
