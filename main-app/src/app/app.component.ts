import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as _ from 'lodash';
import { IframeData } from './iframe.data.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements AfterViewInit {
  myOrigin = 'http://localhost:4201';
  remoteOrigin = 'http://localhost:4200';
  urlQueryParam = 'http://localhost:4200/operation?id=1';
  urlRouteParam = 'http://localhost:4200/operation/2';
  content = 0;
  numOfMessagesRecievedFromIframes = 0;

  urlSafeQueryParam: SafeResourceUrl;
  urlSafeRouteParam: SafeResourceUrl;
  data: IframeData = { count: 0 };

  @ViewChild('iframeapp1', { static: false }) iframe1: ElementRef | undefined;
  @ViewChild('iframeapp2', { static: false }) iframe2: ElementRef | undefined;

  constructor(public sanitizer: DomSanitizer) {
    this.urlSafeQueryParam = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.urlQueryParam
    );
    this.urlSafeRouteParam = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.urlRouteParam
    );
  }

  ngAfterViewInit(): void {
    this.sendDataToIframe(this.iframe1);
    this.sendDataToIframe(this.iframe2);
  }

  sendDataToIframe(iframe: ElementRef | undefined) {
    if (iframe == null) return;
    const iWindow = (<HTMLIFrameElement>iframe.nativeElement).contentWindow;
    if (iWindow === null) return;
    setInterval(() => {
      iWindow.postMessage(
        `main-app:${JSON.stringify(this.data)}`,
        this.remoteOrigin
      );
      this.data.count++;
    }, 1000);
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.type === 'message' && _.isString(event.data)) {
      if (event.origin !== this.myOrigin) {
        const message = event.data;
        const delimiter = message.indexOf(':');
        if (!delimiter) {
          throw new Error('bad message format');
        }
        const source = message.substring(0, delimiter);
        const data: IframeData = JSON.parse(
          message.substring(delimiter + 1, message.length)
        );
        this.content = data.count;
        this.numOfMessagesRecievedFromIframes++;
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

  // ngOnInit(): void {
  //   setInterval(() => {
  //     console.log(
  //       `main-app send message to ${this.remoteOrigin} ${JSON.stringify(
  //         this.data,
  //         null,
  //         4
  //       )}`
  //     );
  //     window.postMessage(
  //       `main-app:${JSON.stringify(this.data)}`,
  //       this.remoteOrigin
  //     );
  //   }, 5000);
  // }
}
