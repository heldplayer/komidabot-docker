import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {SettingsService} from "../settings.service";
import {take} from "rxjs/operators";
import {CampusService} from "../campus.service";
import {ApiResponse} from "../entities";
import * as moment from "moment";
import {dayToIso} from "../utils";

@Component({
  selector: 'app-pwa-start',
  templateUrl: './pwa-start.component.html',
  styleUrls: ['./pwa-start.component.scss']
})
export class PwaStartComponent implements OnInit {

  constructor(
    private router: Router,
    private settings: SettingsService,
    private campusService: CampusService,
  ) {
  }

  ngOnInit(): void {
    this.settings.getStartup()
      .pipe(
        take(1)
      )
      .subscribe(startup => {
        if (startup) {
          this.settings.getCampusForToday()
            .pipe(
              take(1)
            )
            .subscribe(campusId => {
              if (campusId === null) {
                this.router.navigate([''], {queryParamsHandling: 'preserve', replaceUrl: true});
              } else {
                this.campusService.getCampusById(campusId)
                  .pipe(
                    ApiResponse.awaitReady(),
                    take(1)
                  )
                  .subscribe(campus => {
                    const now = moment();
                    if (now.isoWeekday() <= 5) {
                      this.router.navigate(['campus', campus.short_name, 'd', dayToIso(now)],
                        {queryParamsHandling: 'preserve', replaceUrl: true});
                    } else {
                      this.router.navigate([''], {queryParamsHandling: 'preserve', replaceUrl: true});
                    }
                  });
              }
            })
        } else {
          this.router.navigate([''], {queryParamsHandling: 'preserve', replaceUrl: true});
        }
      });
  }

}
