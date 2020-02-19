import {EMPTY, Observable} from "rxjs";

export interface ThreadContext {
  tid: string;
  thread_type: string;
  psid: string;
  signed_request: string;
}

export interface FacebookMessengerAPI {
  getSupportedFeatures(): Observable<string[]>;

  getContext(appId: string): Observable<ThreadContext>;

  requestCloseBrowser(): Observable<void>;
}

export class MessengerAPIException extends Error {
  public readonly description: string;

  constructor(public readonly code: number) {
    super(code + ': ' + MessengerAPIException.lookupDescription(code));
    this.description = MessengerAPIException.lookupDescription(code);
  }

  private static lookupDescription(code: number): string {
    switch (code) {
      case 2071011:
        return 'Not running inside the Messenger Environment';
      case 2018164:
        return 'Invalid App ID';
      default:
        return 'Unknown error';
    }
  }
}

export class MessengerStateBase {

}

export class MessengerStateInvalid extends MessengerStateBase {
  constructor(
    public readonly error: MessengerAPIException,
  ) {
    super();
  }
}

export class MessengerStateValid extends MessengerStateBase {
  constructor(
    public readonly features: string[],
    public readonly psid: string,
    public readonly signature: string,
    public readonly appId: string,
    private readonly api: FacebookMessengerAPI | null,
  ) {
    super();
  }

  public requestCloseBrowser(): Observable<void> {
    if (this.api === null) {
      return EMPTY;
    }
    return this.api.requestCloseBrowser();
  }
}
