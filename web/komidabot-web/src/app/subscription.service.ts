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

  subscriptionCreated(subscription: PushSubscription): Observable<any> {
    console.log('Created subscription:', subscription);
    console.log(JSON.stringify(subscription.toJSON()));

    return this.configService.config.pipe(
      concatMap(config => {
        const subscriptionJson = subscription.toJSON();
        const data = {
          'subscription': {
            'endpoint': subscriptionJson['endpoint'],
            'keys': subscriptionJson['keys'],
            'days': [3, 3, 3, 3, 3]
          }
        };

        return this.http.post<any>(config.subscriptions_endpoint, data, httpOptions);
      })
    );
  }
}
