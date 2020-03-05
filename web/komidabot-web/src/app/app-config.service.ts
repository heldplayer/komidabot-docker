import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, ReplaySubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private appConfig = new ReplaySubject<AppConfig>(1);

  constructor(
    private http: HttpClient,
  ) {
  }

  loadAppConfig(): Promise<any> {
    const queryParams = getQueryParams();
    const isDev = queryParams.has('dev') && queryParams.get('dev') === 'true';

    const configLocation = isDev ? '/assets/config-dev.json' : '/assets/config.json';

    return this.http.get<AppConfig>(configLocation)
      .toPromise()
      .then((data: any) => {
        console.log('App config:', data);
        this.appConfig.next(data);
        this.appConfig.complete();
      });
  }

  get config(): Observable<AppConfig> {
    return this.appConfig.asObservable();
  }
}

export interface AppConfig {
  fb_appId: string;
  vapid_publicKey: string;
  subscriptions_endpoint: string;
  api_endpoint: string;
}

function getQueryParams(): Map<string, string> {
  const result = new Map<string, string>();
  const query = window.location.search;
  const pairs = (query[0] === '?' ? query.substring(1) : query).split('&');

  pairs.forEach(value => {
    const pair = value.split('=', 2);
    result.set(decodeURIComponent(pair[0]), decodeURIComponent(pair[1] || ''));
  });

  return result;
}
