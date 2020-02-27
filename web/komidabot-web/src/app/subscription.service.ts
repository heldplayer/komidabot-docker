import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {AppConfigService} from "./app-config.service";
import {concatMap} from "rxjs/operators";


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(
    private configService: AppConfigService,
    private http: HttpClient,
  ) {
  }

  subscriptionRemoved() {
    // Do anything special?
  }

  subscriptionCreated(data: PushSubscription): Observable<any> {
    console.log('Created subscription:', data);
    console.log(JSON.stringify(data.toJSON()));

    return this.configService.config.pipe(
      concatMap(config => {
        return this.http.post<any>(config.subscriptions_endpoint, data, httpOptions);
      })
    );
  }
}
