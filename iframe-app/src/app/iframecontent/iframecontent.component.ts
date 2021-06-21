import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { IframeData } from '../iframe.data.interface';

@Component({
  selector: 'app-iframecontent',
  templateUrl: './iframecontent.component.html',
  styleUrls: ['./iframecontent.component.less'],
})
export class IframecontentComponent implements OnInit {
  myOrigin = 'http://localhost:4200';
  remoteOrigin = 'http://localhost:4201';
  data: IframeData = { count: 0 };
  content = 0;
  queryParam: string = '';
  routeParam: string = '';
  title: string = '';

  constructor(private route: ActivatedRoute) {}

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
    this.route.queryParams.subscribe((params) => {
      this.queryParam = params['id'] ?? '';
    });
    this.routeParam = this.route.snapshot.paramMap.get('id') ?? '';

    if (this.queryParam.length > 0) {
      this.title = `query param = ${this.queryParam}`;
    } else if (this.routeParam.length > 0) {
      this.title = `route param = ${this.routeParam}`;
    } else {
      this.title = 'none';
    }

    setInterval(() => {
      console.log(
        `iframe-app send message to ${this.myOrigin} ${JSON.stringify(
          this.data,
          null,
          4
        )}`
      );
      window.parent.postMessage(`iframe-app:${JSON.stringify(this.data)}`, '*');
      this.data.count++;
    }, 1000);
  }
}
