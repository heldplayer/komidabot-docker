import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {FacebookMessengerService} from "../facebook-messenger.service";
import {MessengerStateInvalid, MessengerStateValid} from "../../lib/facebook-messenger";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor(
    private messengerService: FacebookMessengerService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.messengerService.state
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        state => {
          if (state instanceof MessengerStateValid) {
            this.router.navigate(['/debug'], {skipLocationChange: true, queryParamsHandling: 'preserve'});
          } else if (state instanceof MessengerStateInvalid) {
            this.router.navigate(['/base'], {skipLocationChange: true, queryParamsHandling: 'preserve'});
          } else {
            this.router.navigate(['/error-page'], {skipLocationChange: true, queryParamsHandling: 'preserve'});
          }
        },
        error => {
          console.warn('Got error', error);
          this.router.navigate(['/error-page'], {skipLocationChange: true, queryParamsHandling: 'preserve'});
        });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
