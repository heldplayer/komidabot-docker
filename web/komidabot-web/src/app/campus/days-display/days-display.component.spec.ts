import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DaysDisplayComponent} from './days-display.component';

describe('DaysDisplayComponent', () => {
  let component: DaysDisplayComponent;
  let fixture: ComponentFixture<DaysDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DaysDisplayComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaysDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
