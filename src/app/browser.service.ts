import { Injectable } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { DocumentViewer } from '@ionic-native/document-viewer/ngx';
import { InAppBrowser, InAppBrowserEvent, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {
  private browser: InAppBrowserObject;
  constructor(
    private iab: InAppBrowser,
    private document: DocumentViewer,
    private transfer: FileTransfer,
    private file: File,
    private platform: Platform) { }

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

      // [SystemBrowser] We want to launch this in the system browser instead of from InAppBrowser
      if (event.url.toLowerCase().startsWith("https://ionic")) {
        console.log(`Opening ${event.url} in system browser`);
        window.open(event.url, '_system', 'location=yes');
        return;
      }

      if (event.url.toLowerCase().endsWith(".pdf")) {
        // If you want to launch PDFs in the system browser uncomment below
        // window.open(event.url, '_system', 'location=yes');
        // return

        this.browser.hide();
        this.download(event.url);
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

  public show() {
    this.browser.show();
  }

  // This downloads the PDF file from the url then displays it
  async download(url: string) {
    const fileTransfer: FileTransferObject = this.transfer.create();
    const path: string = this.platform.is('android') ? this.file.externalApplicationStorageDirectory : this.file.documentsDirectory;
    const filename = 'file.pdf';
    const entry = await fileTransfer.download(url, path + filename);
    const localUrl = entry.toURL();
    console.log('PDF downloaded as ' + localUrl);
    this.document.viewDocument(localUrl, 'application/pdf', { print: { enabled: true } }, () => { }, () => {
      this.file.removeFile(path, filename);
      this.show();
    });
  }

  // This is an example of code that will modify all hyperlinks on the page
  // Add this to executeScript if you want to use it
  private fixLinks(): string {
    return 'for (let link of document.getElementsByTagName("a")) {' +
      '   if (link.href.endsWith("/")) {' +
      '      link.href = link.href.slice(0, -1);' + // Removes trailing slashes on links
      '      link.target = undefined;' + // Ensures the target for any links is undefined
      '      console.log(\'Fix Link\', link.href);' +
      ' }' +
      '};';
  }
}
