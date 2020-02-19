import {async, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {DebugComponent} from './debug.component';

describe('DebugComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        DebugComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(DebugComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'komidabot-web'`, () => {
    const fixture = TestBed.createComponent(DebugComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('komidabot-web');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(DebugComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('komidabot-web app is running!');
  });
});
