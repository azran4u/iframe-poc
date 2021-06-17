import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, AfterViewInit {
  myOrigin = 'http://localhost:4201';
  remoteOrigin = 'http://localhost:4200';

  urlSafe: SafeResourceUrl;
  data = { a: 1, b: new Date() };

  constructor(public sanitizer: DomSanitizer) {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.remoteOrigin
    );
  }
  ngAfterViewInit(): void {
    var iframe = document.getElementById('iframeapp');
    if (iframe == null) return;
    const iWindow = (<HTMLIFrameElement>iframe).contentWindow;
    if (iWindow === null) return;
    setInterval(() => {
      debugger;
      iWindow.postMessage(
        `main-app:${JSON.stringify(this.data)}`,
        this.remoteOrigin
      );
    }, 5000);
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.type === 'message' && _.isString(event.data)) {
      debugger;
      if (event.origin !== this.myOrigin) {
        debugger;
        const message = event.data;
        const delimiter = message.indexOf(':');
        if (!delimiter) {
          throw new Error('bad message format');
        }
        const source = message.substring(0, delimiter);
        const data = JSON.parse(
          message.substring(delimiter + 1, message.length)
        );
        data.b = new Date(data.b);
        console.log(
          `main-app rcv message source: ${source} data: ${JSON.stringify(
            data,
            null,
            4
          )}`
        );
      }
    }
  }

  ngOnInit(): void {
    setInterval(() => {
      console.log(
        `main-app send message to ${this.remoteOrigin} ${JSON.stringify(
          this.data,
          null,
          4
        )}`
      );
      window.postMessage(
        `main-app:${JSON.stringify(this.data)}`,
        this.remoteOrigin
      );
    }, 5000);
  }
}
