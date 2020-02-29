import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {Menu, MenuItemType} from "../types";
import {switchMap} from "rxjs/operators";
import {Observable, of} from "rxjs";
import * as moment from 'moment';

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styleUrls: ['./campus.component.scss']
})
export class CampusComponent implements OnInit {
  display$: Observable<DisplayState>;

  constructor(
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.display$ = this.route.params.pipe(
      switchMap((params: Params) => {
        if ('date' in params) {
          const date = moment.utc(params['date']);

          return of({
            campus: params['campus'],
            menu: {
              day: date,
              items: [
                {
                  type: MenuItemType.MEAT,
                  description: 'Test meat',
                  price_students: 'Tree fiddy'
                }
              ]
            },
          });
        }

        const now = moment.utc();
        let week = now.startOf('week');

        if ('week' in params) {
          week = moment.utc(params['week']).startOf('week');
        }

        const nextWeek = week.clone().add(1, 'week');
        const prevWeek = week.clone().subtract(1, 'week');

        return of({
          campus: params['campus'],
          days: getDaysForWeek(week),
          next_week: nextWeek,
          prev_week: prevWeek,
          isThisWeek: prevWeek < now && now < nextWeek
        });
      })
    );
  }

  dayForUrl(day: moment.Moment): string {
    return day.format('YYYY-MM-DD');
  }

  dayForDisplay(day: moment.Moment) {
    let weekday: string;
    let month = '';
    switch (day.weekday()) {
      case 0:
        weekday = 'Maandag';
        break;
      case 1:
        weekday = 'Dinsdag';
        break;
      case 2:
        weekday = 'Woensdag';
        break;
      case 3:
        weekday = 'Donderdag';
        break;
      case 4:
        weekday = 'Vrijdag';
        break;
      default:
        weekday = '???';
    }
    switch (day.month()) {
      case 0:
        month = 'Januari';
        break;
      case 1:
        month = 'Februari';
        break;
      case 2:
        month = 'Maart';
        break;
      case 3:
        month = 'April';
        break;
      case 4:
        month = 'Mei';
        break;
      case 5:
        month = 'Juni';
        break;
      case 6:
        month = 'Juli';
        break;
      case 7:
        month = 'Augustus';
        break;
      case 8:
        month = 'September';
        break;
      case 9:
        month = 'October';
        break;
      case 10:
        month = 'November';
        break;
      case 11:
        month = 'December';
        break;
      default:
        month = '???';
    }
    return `${weekday} ${day.date()} ${month}`
  }
}

function getDaysForWeek(day: moment.Moment): moment.Moment[] {
  const weekStart = day.startOf('week');

  const days = [];
  for (let i = 0; i <= 4; i++) {
    days.push(weekStart.clone().add(i, 'days'));
  }

  return days;
}

interface DisplayState {
  campus: string;
  days?: moment.Moment[];
  menu?: Menu;
  next_week?: moment.Moment;
  prev_week?: moment.Moment;
  isThisWeek?: boolean;
}
