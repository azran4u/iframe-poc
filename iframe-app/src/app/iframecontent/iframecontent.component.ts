import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IframeData } from '../iframe.data.interface';

@Component({
  selector: 'app-iframecontent',
  templateUrl: './iframecontent.component.html',
  styleUrls: ['./iframecontent.component.less'],
})
export class IframecontentComponent implements OnInit {
  origin = window.location.origin;
  data: IframeData = { count: 0 };
  content = 0;
  routeParam: string = '';
  queryParam$ = new Observable<string>();
  title$ = new Observable<string>();

  constructor(private route: ActivatedRoute) {}

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.type === 'message' && _.isString(event.data)) {
      if (event.origin !== this.origin) {
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
    this.queryParam$ = this.route.queryParams.pipe(
      map((params) => params['id'] ?? '')
    );

    this.routeParam = this.route.snapshot.paramMap.get('id') ?? '';

    this.title$ = this.queryParam$.pipe(
      map((param) => {
        return param ? param : this.routeParam ?? 'none';
      })
    );

    setInterval(() => {
      console.log(
        `iframe-app send message to ${this.origin} ${JSON.stringify(
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
