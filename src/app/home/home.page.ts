import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BrowserService } from '../browser.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(
    private platform: Platform,
    private browserService: BrowserService) {
    this.platform.ready().then(() => {
      this.browserService.open('https://cs-links.netlify.app/');      
    });
  }
}
