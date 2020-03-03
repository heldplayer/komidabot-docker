import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {timer} from "rxjs";

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {

  // loading = false;
  closing = false;

  constructor() {
  }

  ngOnInit(): void {
    // timer(150) // Emits only once
    //   .subscribe(() => this.loading = true);

    // timer(1000) // Emits only once
    //   .subscribe(() => this.closeSplash());

    timer(150) // Emits only once
      .subscribe(() => this.closeSplash());
  }

  @Output()
  delete: EventEmitter<string> = new EventEmitter();

  closeSplash() {
    this.closing = true;
    timer(420)  // Emits only once
      .subscribe(() => this.delete.emit());
  }

}
