import {Component, OnDestroy, OnInit} from '@angular/core';
import {SwPush} from "@angular/service-worker";
import {AppConfigService} from "../app-config.service";
import {merge, Observable, of, Subject} from "rxjs";
import {SubscriptionService} from "../subscription.service";
import {catchError, map, take, takeUntil, tap} from "rxjs/operators";
import {Campus, Menu, MenuItemType} from "../types";

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  VAPID_PUBLIC_KEY: string | null = null;

  subscriptionState: Observable<{ subscribed: boolean, subscribable: boolean }>;

  campuses$: Observable<Campus[]> = of([
    {
      id: 1,
      short_name: 'cst',
      name: 'Stadscampus'
    },
    {
      id: 2,
      short_name: 'cde',
      name: 'Campus Drie Eiken'
    },
    {
      id: 3,
      short_name: 'cmi',
      name: 'Campus Middelheim'
    },
    {
      id: 4,
      short_name: 'cgb',
      name: 'Campus Groenenborger'
    },
    {
      id: 5,
      short_name: 'cmu',
      name: 'Campus Mutsaard'
    },
    {
      id: 6,
      short_name: 'hzs',
      name: 'Hogere Zeevaartschool'
    },
  ]);

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
