import {Component, OnDestroy, OnInit} from '@angular/core';
import {merge, Observable, of, Subject} from "rxjs";
import {AppConfigService} from "../app-config.service";
import {SubscriptionService} from "../subscription.service";
import {SwPush} from "@angular/service-worker";
import {catchError, map, take, takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-subscription-button',
  templateUrl: './subscription-button.component.html',
  styleUrls: ['./subscription-button.component.scss']
})
export class SubscriptionButtonComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  VAPID_PUBLIC_KEY: string | null = null;

  subscriptionState: Observable<{ subscribed: boolean, subscribable: boolean }>;

  constructor(
    private configService: AppConfigService,
    private subscriptionService: SubscriptionService,
    private swPush: SwPush,) {
  }

  ngOnInit(): void {
    this.configService.config
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(config => this.VAPID_PUBLIC_KEY = config.vapid_publicKey);

    this.subscriptionState = merge(
      of({subscribed: false, subscribable: false}),
      this.swPush.subscription.pipe(
        map(subscription => {
          return {subscribed: subscription !== null, subscribable: true}
        }),
        catchError((err) => {
          console.log('Caught error', err);
          return [{subscribed: false, subscribable: false}];
        })
      )
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  unsubscribe() {
    this.swPush.unsubscribe()
      .then(() => this.subscriptionService.subscriptionRemoved())
      .catch(err => console.error('Could not unsubscribe from notifications', err))
  }

  subscribeToNotifications() {
    console.log('VAPID key:', this.VAPID_PUBLIC_KEY);
    this.swPush.requestSubscription({
      serverPublicKey: <string>this.VAPID_PUBLIC_KEY
    }).then(sub => this.subscriptionService.subscriptionCreated(sub).pipe(take(1)).subscribe())
      .catch(err => console.error('Could not subscribe to notifications', err));
  }
}
