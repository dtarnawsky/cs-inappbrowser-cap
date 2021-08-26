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
      this.open('https://cs-links.netlify.app/');
    });
  }

  public open(url: string) {
    this.browser = this.iab.create(url, '_blank', 'location=no,beforeload=yes');

    this.browser.on('loadstop').subscribe((event: InAppBrowserEvent) => {
      console.log(`loadstop ${JSON.stringify(event)}`);

      // This injects code on the page to wait for changes in the browser location and sends a message with the url to the application
      this.browser.executeScript({
        code: 'setInterval(() => { if (window.lastHref != location.href) { let data = JSON.stringify({href: location.href}); window.lastHref = location.href; try { webkit.messageHandlers.cordova_iab.postMessage(data); } catch (err) { console.error(err); } } },100);'
      });
    });

    this.browser.on('loadstart').subscribe((event: InAppBrowserEvent) => {
      // Fires on iOS
      // Fires on Android
      console.log(`loadstart ${JSON.stringify(event)}`);
    });

    this.browser.on('loaderror').subscribe((event: InAppBrowserEvent) => {
      console.log(`loaderror ${JSON.stringify(event)}`);
    });

    this.browser.on('beforeload').subscribe((event: InAppBrowserEvent) => {
      // Fires on iOS
      // Does not fire on Android on startup of first browser load but does fire afterwards
      console.log(`beforeload ${JSON.stringify(event)}`);

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

      // This will output the object in event.data. You could reference event.data.href
      console.log(`message`, event.data);
    });
  }
}
