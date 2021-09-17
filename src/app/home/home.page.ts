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
    this.platform.ready().then(() => {
      this.open('https://cs-links.netlify.app/');
    });
  }

  // This is an example of code that will modify all hyperlinks on the page
  // Add this to executeScript if you want to use it
  private fixLinks(): string {
    return 'for (let link of document.getElementsByTagName("a")) {' +
      '   if (link.href.endsWith("/")) {' +
      '      link.href = link.href.slice(0, -1);' + // Removes trailing slashes on links
      '      link.target = "_system";' + // Ensures the target for any links is _blank
      '      console.log(\'Fix Link\', link.href);' +
      ' }' +
      '};';
  }

  public open(url: string) {
    console.log(`open ${url}`);
    this.browser = this.iab.create(url, '_blank',
      {
        location: 'no',
        beforeload: 'yes',
        suppressesIncrementalRendering: 'yes'
      });

    this.browser.on('loadstop').subscribe(async (event: InAppBrowserEvent) => {
      console.log(`loadstop ${JSON.stringify(event)}`);

      // This injects code on the page to wait for changes in the browser location and sends a message with the url to the application
      await this.browser.executeScript({
        code: 'setInterval(() => { if (window.lastHref != location.href) { var data = JSON.stringify({href: location.href}); window.lastHref = location.href; try { webkit.messageHandlers.cordova_iab.postMessage(data); } catch (err) { console.error(err); } } },100);'
      });
    });

    this.browser.on('loadstart').subscribe((event: InAppBrowserEvent) => {
      console.log(`loadstart ${JSON.stringify(event)}`);
    });

    this.browser.on('loaderror').subscribe((event: InAppBrowserEvent) => {
      console.log(`loaderror ${JSON.stringify(event)}`);
    });

    this.browser.on('beforeload').subscribe((event: InAppBrowserEvent) => {
      console.log(`beforeload ${JSON.stringify(event)}`);

      // We want to launch this in the system browser instead of from InAppBrowser
      if (event.url.toLowerCase().startsWith("https://ionic")) {
        console.log(`Opening ${event.url} in system browser`);
        window.open(event.url, '_system', 'location=yes');
        return;
      }

      // We want to launch this in the system browser instead of from InAppBrowser
      if (event.url.toLowerCase().endsWith(".pdf")) {
        console.log(`Opening ${event.url} in system browser`);
        window.open(event.url, '_system', 'location=yes');
        return;
      }

      // Callback to ensure the url loads
      console.log('_loadAfterBeforeLoad ' + event.url);
      this.browser._loadAfterBeforeload(event.url);
    });

    this.browser.on('message').subscribe((event: InAppBrowserEvent) => {
      // This will output the object in event.data. You could reference event.data.href
      console.log(`message`, event.data);
    });
  }
}
