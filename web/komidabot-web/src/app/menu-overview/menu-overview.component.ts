import {Component} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import * as moment from "moment";
import {combineLatest, Observable} from "rxjs";
import {CampusService} from "../campus.service";
import {ApiResponse, Campus} from "../entities";
import {map} from "rxjs/operators";
import {dayToIso} from "../utils";

@Component({
  selector: 'app-menu-overview',
  templateUrl: './menu-overview.component.html',
  styleUrls: ['./menu-overview.component.scss']
})
export class MenuOverviewComponent {

  display$: Observable<DisplayState>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private campusService: CampusService,
  ) {
    this.display$ = combineLatest([
      this.route.params,
      this.campusService.getAllCampuses().pipe(ApiResponse.awaitReady())
    ])
      .pipe(
        map((data) => {
          const params = <Params>data[0];
          const campuses = <Campus[]>data[1];

          const date = moment(params['date']);

          return {
            campuses: campuses.map(campus => campus.short_name),
            menu_day: date
          };
        })
      );
  }

  selectDay(date: moment.Moment | null) {
    this.router.navigate(['/overview', dayToIso(<moment.Moment>date)])
  }
}

interface DisplayState {
  campuses: string[];
  menu_day: moment.Moment;
}
