import {Component, OnDestroy, OnInit} from '@angular/core';
import {SwPush} from "@angular/service-worker";
import {AppConfigService} from "../app-config.service";
import {Observable, Subject} from "rxjs";
import {SubscriptionService} from "../subscription.service";
import {map, take, takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  subscriptionState: Observable<{ subscribed: boolean }>;

  VAPID_PUBLIC_KEY: string | null = null;

  constructor(
    private configService: AppConfigService,
    private subscriptionService: SubscriptionService,
    private swPush: SwPush,
  ) {
  }

  ngOnInit(): void {
    let subscription = this.configService.config
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(config => this.VAPID_PUBLIC_KEY = config.vapid_publicKey);

    this.subscriptionState = this.swPush.subscription.pipe(
      map(subscription => {
        return {subscribed: subscription !== null}
      })
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
