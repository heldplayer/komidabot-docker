import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PwaStartComponent} from './pwa-start.component';

describe('PwaStartComponent', () => {
  let component: PwaStartComponent;
  let fixture: ComponentFixture<PwaStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PwaStartComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PwaStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
