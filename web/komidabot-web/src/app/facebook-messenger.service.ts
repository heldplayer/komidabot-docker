import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {catchError, concatMap, debounceTime, map, share, takeUntil, tap} from "rxjs/operators";
import {
  FacebookMessengerAPI,
  MessengerAPIException,
  MessengerStateBase,
  MessengerStateInvalid,
  MessengerStateValid,
  ThreadContext
} from "../lib/facebook-messenger";
import {AppConfigService} from "./app-config.service";

interface SupportedFeatures {
  supported_features: string[];
}

interface FacebookMessengerSDK {
  getSupportedFeatures(success: (features: SupportedFeatures) => any, error: (error: any) => any): void;

  getContext(app_id: string, success: (context: ThreadContext) => any, error: (error: any) => any): void;

  requestCloseBrowser(success: () => any, error: (error: any) => any): void;
}

class FacebookMessengerAPIImpl implements FacebookMessengerAPI {
  private api: Observable<FacebookMessengerSDK>;

  constructor(
    api: Observable<FacebookMessengerSDK>,
    private zone: NgZone,
  ) {
    this.api = api.pipe(
      share()
    );
  }

  getSupportedFeatures(): Observable<string[]> {
    return this.api.pipe(
      concatMap(api => new Observable<string[]>(subscriber => {
        api.getSupportedFeatures(features => {
          this.zone.run(() => {
            subscriber.next(features.supported_features);
            subscriber.complete();
          });
        }, (err) => {
          this.zone.run(() => {
            subscriber.error(new MessengerAPIException(err));
            subscriber.complete();
          });
        })
      }))
    );
  }

  getContext(appId: string): Observable<ThreadContext> {
    return this.api.pipe(
      concatMap(api => new Observable<ThreadContext>(subscriber => {
        api.getContext(appId, context => {
          this.zone.run(() => {
            subscriber.next(context);
            subscriber.complete();
          });
        }, (err) => {
          this.zone.run(() => {
            subscriber.error(new MessengerAPIException(err));
            subscriber.complete();
          });
        })
      }))
    );
  }

  requestCloseBrowser(): Observable<void> {
    return this.api.pipe(
      concatMap(api => new Observable<void>(subscriber => {
        api.requestCloseBrowser(() => {
          this.zone.run(() => {
            subscriber.next();
            subscriber.complete();
          });
        }, (err) => {
          this.zone.run(() => {
            subscriber.error(new MessengerAPIException(err));
            subscriber.complete();
          });
        })
      }))
    );
  }
}

declare var MessengerExtensions: FacebookMessengerSDK;

@Injectable({
  providedIn: 'root'
})
export class FacebookMessengerService implements OnDestroy {
  private unsubscribe$ = new Subject<void>();

  private readonly messengerApiSubject = new ReplaySubject<FacebookMessengerSDK>(1);
  private readonly messengerApi$ = this.messengerApiSubject.asObservable().pipe(
    debounceTime(10),
    // tap(x => console.log('Messenger API:', x)),
    share()
  );
  private readonly apiSubject = new ReplaySubject<FacebookMessengerAPI>(1);
  private readonly api$ = this.apiSubject.asObservable().pipe(
    debounceTime(10),
    // tap(x => console.log('API Object:', x)),
    share()
  );
  private readonly apiStateSubject = new ReplaySubject<MessengerStateBase>(1);
  private readonly apiState$ = this.apiStateSubject.asObservable().pipe(
    debounceTime(10),
    // tap(x => console.log('API State:', x)),
    share()
  );

  private readonly appId$: Observable<string>;

  private scriptElement: HTMLScriptElement;

  constructor(
    private configService: AppConfigService,
    private zone: NgZone,
  ) {
    this.apiSubject.next(new FacebookMessengerAPIImpl(this.messengerApi$, this.zone));

    this.appId$ = this.configService.config.pipe(
      map((config) => config.fb_appId),
      debounceTime(100),
      tap(x => console.log('App ID:', x))
    );

    combineLatest(this.api$, this.appId$).pipe(
      concatMap(apiData => {
        const api = <FacebookMessengerAPI>apiData[0];
        const appId = <string>apiData[1];

        return combineLatest(api.getSupportedFeatures(), api.getContext(appId)).pipe(
          map(value => {
            const features = <string[]>value[0];
            const context = <ThreadContext>value[1];

            return new MessengerStateValid(features, context.psid, context.signed_request, appId, api);
          })
        );
      }),
      tap(x => console.log('API State:', x), e => console.log('API Object error:', (<Error>e).message)),
      catchError<MessengerStateBase, MessengerStateBase[]>(error => [new MessengerStateInvalid(error)]),
      share(),
      takeUntil(this.unsubscribe$)
    ).subscribe(state => this.apiStateSubject.next(state));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private ensureLoaded() {
    if (this.scriptElement) {
      return;
    }

    // console.info('Loading Facebook Messenger Service');

    (<any>window).extAsyncInit = () => {
      this.messengerApiSubject.next(MessengerExtensions);
    };

    this.scriptElement = document.createElement('script');
    this.scriptElement.src = '//connect.facebook.net/en_US/messenger.Extensions.js';
    document.head.append(this.scriptElement);

    // console.info('Injected API');
  }

  public get state(): Observable<MessengerStateBase> {
    this.ensureLoaded();

    return this.apiState$;
  }
}
