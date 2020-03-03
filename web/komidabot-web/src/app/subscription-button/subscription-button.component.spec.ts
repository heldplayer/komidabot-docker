import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SubscriptionButtonComponent} from './subscription-button.component';

describe('SubscriptionButtonComponent', () => {
  let component: SubscriptionButtonComponent;
  let fixture: ComponentFixture<SubscriptionButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionButtonComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
