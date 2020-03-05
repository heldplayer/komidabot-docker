import {Component} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";
import * as moment from 'moment';

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styleUrls: ['./campus.component.scss']
})
export class CampusComponent {

  display$: Observable<DisplayState>;

  constructor(
    private route: ActivatedRoute,
  ) {
    this.display$ = this.route.params
      .pipe(
        map((params: Params) => {
          if ('date' in params) {
            const date = moment(params['date']);

            return {
              campus: params['campus'],
              menu_day: date
            };
          }

          const now = moment();
          let week = now.startOf('isoWeek');

          if ('week' in params) {
            week = moment(params['week']).startOf('isoWeek');
          }

          return {
            campus: params['campus'],
            week_start: week
          };
        })
      );
  }
}

interface DisplayState {
  campus: string;
  menu_day?: moment.Moment;
  week_start?: moment.Moment;
}
