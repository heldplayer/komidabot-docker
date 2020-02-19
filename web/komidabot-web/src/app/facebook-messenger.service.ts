import {Injectable, NgZone} from '@angular/core';
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {catchError, concatMap, debounceTime, map, share, tap} from "rxjs/operators";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {
  FacebookMessengerAPI,
  MessengerAPIException,
  MessengerStateBase,
  MessengerStateInvalid,
  MessengerStateValid,
  ThreadContext
} from "../lib/facebook-messenger";

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
export class FacebookMessengerService {

  private readonly messengerApiSubject = new ReplaySubject<FacebookMessengerSDK>(1);
  private readonly messengerApi$ = this.messengerApiSubject.asObservable().pipe(
    debounceTime(10),
    tap(x => console.log('Messenger API:', x))
  );
  private readonly appIdSubject = new ReplaySubject<string>(1);
  private readonly appId$ = this.appIdSubject.asObservable().pipe(
    debounceTime(100),
    tap(x => console.log('App ID:', x))
  );
  private readonly apiSubject = new ReplaySubject<FacebookMessengerAPI>(1);
  private readonly api$ = this.apiSubject.asObservable().pipe(
    debounceTime(10),
    tap(x => console.log('API Object:', x)),
    share()
  );

  private readonly apiState$: Observable<MessengerStateBase>;

  private scriptElement: HTMLScriptElement;

  constructor(
    private route: ActivatedRoute,
    private zone: NgZone,
  ) {
    this.apiSubject.next(new FacebookMessengerAPIImpl(this.messengerApi$, this.zone));

    this.route.queryParamMap.subscribe((value: ParamMap) => {
      const isDev = value.has('dev') && value.get('dev') === 'true';
      if (isDev) {
        this.appIdSubject.next('1356185317877412');
      } else {
        this.appIdSubject.next('149768398970929');
      }
    });

    this.apiState$ = combineLatest(this.api$, this.appId$).pipe(
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
      share()
    );
  }

  private ensureLoaded() {
    if (this.scriptElement) {
      return;
    }

    console.info('Loading Facebook Messenger Service');

    (<any>window).extAsyncInit = () => {
      this.messengerApiSubject.next(MessengerExtensions);
    };

    this.scriptElement = document.createElement('script');
    this.scriptElement.src = '//connect.facebook.net/en_US/messenger.Extensions.js';
    document.head.append(this.scriptElement);

    console.info('Injected API');
  }

  public get state(): Observable<MessengerStateBase> {
    this.ensureLoaded();

    return this.apiState$;
  }
}
