import {ApplicationRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {MessengerStateBase, MessengerStateInvalid, MessengerStateValid} from "../../lib/facebook-messenger";
import {FacebookMessengerService} from "../facebook-messenger.service";
import {SwUpdate} from "@angular/service-worker";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  title = 'komidabot-web';
  messengerState: MessengerStateBase;

  constructor(
    private messengerService: FacebookMessengerService,
    private app: ApplicationRef,
    private updates: SwUpdate
  ) {
  }

  ngOnInit(): void {
    this.messengerService.state
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        value => {
          this.setMessengerState(value);
        },
        error => {
          console.warn('Got error', error);
          this.setMessengerState(new MessengerStateInvalid(error));
        });

    // subscription = this.updates.activated.subscribe();

    // subscription = interval(1000)
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(() => this.changeDetector.markForCheck());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
