import {TestBed} from '@angular/core/testing';

import {FacebookMessengerService} from './facebook-messenger.service';

describe('FacebookMessengerService', () => {
  let service: FacebookMessengerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacebookMessengerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
