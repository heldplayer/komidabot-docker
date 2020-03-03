import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-pwa-start',
  templateUrl: './pwa-start.component.html',
  styleUrls: ['./pwa-start.component.scss']
})
export class PwaStartComponent implements OnInit {

  constructor(
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.router.navigate([''], {queryParamsHandling: 'preserve', replaceUrl: true});
  }

}
