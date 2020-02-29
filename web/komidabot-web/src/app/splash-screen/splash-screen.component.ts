import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {take} from "rxjs/operators";
import {timer} from "rxjs";

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {

  loading = false;
  closing = false;

  constructor() {
  }

  ngOnInit(): void {
    timer(100).pipe(
      take(1)
    ).subscribe(() => this.loading = true);
  }

  @Output()
  delete: EventEmitter<string> = new EventEmitter();

  closeSplash() {
    this.closing = true;
    timer(420).pipe(
      take(1)
    ).subscribe(() => this.delete.emit());
  }

}
