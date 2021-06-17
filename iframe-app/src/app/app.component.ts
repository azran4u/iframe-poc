import { Component, HostListener, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  myOrigin = 'http://localhost:4200';
  remoteOrigin = 'http://localhost:4201';

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
          `iframe-app rcv message source: ${source} data: ${JSON.stringify(
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
      const data = { a: 1, b: new Date() };
      console.log(
        `iframe-app send message to ${this.remoteOrigin} ${JSON.stringify(
          data,
          null,
          4
        )}`
      );
      window.postMessage(
        `iframe-app:${JSON.stringify(data)}`,
        this.remoteOrigin
      );
    }, 5000);
  }
}
