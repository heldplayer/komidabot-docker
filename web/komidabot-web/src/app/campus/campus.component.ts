import {Component} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";
import * as moment from 'moment';
import {dayToIso} from "../utils";

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styleUrls: ['./campus.component.scss']
})
export class CampusComponent {

  display$: Observable<DisplayState>;

  private campus: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.display$ = this.route.params
      .pipe(
        map((params: Params) => {
          this.campus = params['campus'];

          if ('date' in params) {
            const date = moment(params['date']);

            return {
              campus: this.campus,
              menu_day: date
            };
          }

          const now = moment();
          let week = now.startOf('isoWeek');

          if ('week' in params) {
            week = moment(params['week']).startOf('isoWeek');
          }

          return {
            campus: this.campus,
            week_start: week
          };
        })
      );
  }

  selectDay(date: moment.Moment | null) {
    this.router.navigate(['/campus', this.campus, 'd', dayToIso(<moment.Moment>date)])
  }
}

interface DisplayState {
  campus: string;
  menu_day?: moment.Moment;
  week_start?: moment.Moment;
}
