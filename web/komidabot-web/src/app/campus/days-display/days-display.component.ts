import {Component, Input, OnInit} from '@angular/core';
import * as moment from "moment";
import {CampusService} from "../../campus.service";
import {Observable, ReplaySubject} from "rxjs";
import {map, startWith, switchMap} from "rxjs/operators";
import {ClosedDay} from "../../entities";
import {dayToDisplay, dayToIso} from "../../utils";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-days-display',
  templateUrl: './days-display.component.html',
  styleUrls: ['./days-display.component.scss']
})
export class DaysDisplayComponent implements OnInit {

  @Input()
  campus: string;

  private _weekStart: moment.Moment;

  @Input()
  set weekStart(value: moment.Moment) {
    this._weekStart = value;
    this.previousWeek = value.clone().subtract(1, 'week');
    this.nextWeek = value.clone().add(1, 'week');

    this.weekStartSubject.next(value);
  }

  get weekStart(): moment.Moment {
    return this._weekStart;
  }

  previousWeek: moment.Moment;
  nextWeek: moment.Moment;

  private weekStartSubject = new ReplaySubject<moment.Moment>(1);
  days$: Observable<DayInfo[]>;

  get days(): moment.Moment[] {
    const weekStart = this.weekStart.startOf('isoWeek');

    const days = [];
    for (let i = 0; i <= 4; i++) {
      days.push(weekStart.clone().add(i, 'days'));
    }

    return days;
  }

  get weekDescription(): string {
    /*
     *                                  now
     *                     v             v             v
     *  ----------------------------------------------------------------------
     *  ^             ^             ^             ^             ^
     *  S PPrev week  S Prev week   S This week   S Next week   S NNext week
     */

    const now = moment();

    if (this.previousWeek <= now && now < this._weekStart) {
      return 'WEEK.NEXT';
    }

    if (this._weekStart <= now && now < this.nextWeek) {
      return 'WEEK.CURRENT';
    }

    const nextNextWeek = this.nextWeek.clone().add(1, 'week');

    if (this.nextWeek <= now && now < nextNextWeek) {
      return 'WEEK.PREVIOUS';
    }

    return '';
  }

  constructor(
    private campusService: CampusService,
    private translate: TranslateService,
  ) {
    this.days$ = this.weekStartSubject.asObservable()
      .pipe(
        switchMap((weekStart: moment.Moment) => this.campusService.getWeekClosingDays(weekStart, this.campus)),
        map((days: (ClosedDay | null)[]) => days.map((closed, index) => ({
          closed: closed,
          day: this.weekStart.clone().add(index, 'days')
        })))
      );
  }

  ngOnInit(): void {
    this.campusService.getWeekClosingDays(this.weekStart, this.campus)
  }

  getCampusName(campus: string): Observable<string> {
    return this.campusService.getCampus(campus)
      .pipe(
        map(campus => campus.name),
        startWith(campus)
      );
  }

  isCampusClosed(info: DayInfo): boolean {
    return info.closed !== null;
  }

  getDaySubscript(info: DayInfo): string {
    if (this.isCampusClosed(info)) {
      // return 'Closed for X (DD-MM-YYYY - DD-MM-YYYY)';
      console.log(info);
      if (this.translate.currentLang == 'nl') {
        // FIXME
        return info.closed?.reason['nl_BE'] || info.closed?.reason['nl_NL'] || 'Gesloten';
      } else {
        return info.closed?.reason['en_US'] || 'Closed';
      }
      // return 'Closed for X (DD\xa0Month - DD\xa0Month)'; // Alternatively. \xa0 == non breaking space
    }
    // return 'Open from 11:45 to 13:45';
    return '';
  }

  dayForUrl(day: moment.Moment): string {
    return dayToIso(day);
  }

  dayForDisplay(day: moment.Moment) {
    return dayToDisplay(day);
  }
}

interface DayInfo {
  day: moment.Moment;
  closed: ClosedDay | null;
}
