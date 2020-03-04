import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {map, switchMap} from "rxjs/operators";
import {Observable, of} from "rxjs";
import * as moment from 'moment';
import {Menu} from "../entities";
import {CampusService} from "../campus.service";

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styleUrls: ['./campus.component.scss']
})
export class CampusComponent implements OnInit {
  display$: Observable<DisplayState>;

  constructor(
    private route: ActivatedRoute,
    private campusService: CampusService,
  ) {
  }

  ngOnInit(): void {
    this.display$ = this.route.params.pipe(
      switchMap((params: Params) => {
        if ('date' in params) {
          const date = moment(params['date']);

          return this.campusService.getMenuForDay(params['campus'], date)
            .pipe(
              map(menu => ({
                campus: params['campus'],
                menu: <Menu>menu,
                menu_day: date
              }))
            );
        }

        const now = moment();
        let week = now.startOf('isoWeek');

        if ('week' in params) {
          week = moment(params['week']).startOf('isoWeek');
        }

        return of({
          campus: params['campus'],
          week_start: week
        });
      })
    );
  }

}

interface DisplayState {
  campus: string;
  menu?: Menu;
  menu_day?: moment.Moment;
  week_start?: moment.Moment;
}
