import {ApplicationRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {MessengerStateBase, MessengerStateInvalid, MessengerStateValid} from "../../lib/facebook-messenger";
import {FacebookMessengerService} from "../facebook-messenger.service";
import {SwUpdate} from "@angular/service-worker";

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit, OnDestroy {
  title = 'komidabot-web';
  messengerState: MessengerStateBase;

  private subscriptions: Subscription[] = [];

  constructor(
    private messengerService: FacebookMessengerService,
    private app: ApplicationRef,
    private updates: SwUpdate
  ) {
  }

  ngOnInit(): void {
    let subscription = this.messengerService.state.subscribe(
      value => {
        this.setMessengerState(value);
      },
      error => {
        console.warn('Got error', error);
        this.setMessengerState(new MessengerStateInvalid(error));
      });
    this.subscriptions.push(subscription);

    // subscription = this.updates.activated.subscribe();

    // subscription = interval(1000).subscribe(() => this.changeDetector.markForCheck());
    // this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  get location(): string {
    return window.location.pathname + window.location.search + window.location.hash;
  }

  get serviceWorkerStatus(): string {
    return this.updates.isEnabled ? 'ENABLED' : 'DISABLED';
  }

  setMessengerState(state: MessengerStateBase) {
    this.messengerState = state;
    // this.app.tick();
  }

  getStateAsValid(): MessengerStateValid | null {
    if (this.messengerState instanceof MessengerStateValid) {
      return this.messengerState;
    }
    return null;
  }

  getStateAsInvalid(): MessengerStateInvalid | null {
    if (this.messengerState instanceof MessengerStateInvalid) {
      return this.messengerState;
    }
    return null;
  }
}
