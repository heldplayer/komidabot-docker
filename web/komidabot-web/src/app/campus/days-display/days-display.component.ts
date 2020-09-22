import {Component, Input} from '@angular/core';
import * as moment from "moment";
import {CampusService} from "../../campus.service";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {ApiResponse, ClosingDay, ClosingDays} from "../../entities";
import {dayToIso, getClosedDisplay} from "../../utils";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-days-display',
  templateUrl: './days-display.component.html',
  styleUrls: ['./days-display.component.scss']
})
export class DaysDisplayComponent {

  days$: Observable<DayInfo[]>;
  campusName$: Observable<string>;

  previousWeek: moment.Moment;
  nextWeek: moment.Moment | null;

  // INPUT: campus
  private campusSubject = new ReplaySubject<string>(1);
  private _campus: string;

  @Input()
  set campus(value: string) {
    this._campus = value;
    this.campusSubject.next(value);
  }

  get campus(): string {
    return this._campus;
  }

  // INPUT: weekStart
  private weekStartSubject = new ReplaySubject<moment.Moment>(1);
  private _weekStart: moment.Moment;

  @Input()
  set weekStart(value: moment.Moment) {
    this._weekStart = value.clone().startOf('isoWeek');
    this.previousWeek = this._weekStart.clone().subtract(1, 'week');
    if (this._weekStart > moment()) {
      this.nextWeek = null;
    } else {
      this.nextWeek = this._weekStart.clone().add(1, 'week');
    }

    this.weekStartSubject.next(this._weekStart);
  }

  get weekStart(): moment.Moment {
    return this._weekStart;
  }

  constructor(
    private campusService: CampusService,
    private translate: TranslateService,
  ) {
    this.days$ = combineLatest([this.campusSubject.asObservable(), this.weekStartSubject.asObservable()])
      .pipe(
        distinctUntilChanged((p, n) => p[0] === n[0] && p[1].isSame(n[1], 'week')),
        switchMap(data => {
          const campus: string = data[0];
          const weekStart: moment.Moment = data[1];

          return this.campusService.getWeekClosingDays(weekStart, campus)
            .pipe(
              ApiResponse.awaitReady<ClosingDays>(),
              startWith([null, null, null, null, null]),
            );
        }),
        map((days: ClosingDays) => days.map((closed, index) => ({
          closed: closed,
          day: this.weekStart.clone().add(index, 'days')
        }))),
      );

    this.campusName$ = this.campusSubject.asObservable()
      .pipe(
        switchMap(campus => this.campusService.getCampus(campus)
          .pipe(
            ApiResponse.awaitReady(),
            map(campus => campus.name),
            startWith(campus),
          )
        ),
      );
  }

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

    if (this.nextWeek === null) {
      return '';
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

  isCampusClosed(info: DayInfo): boolean {
    return info.closed !== null;
  }

  getDaySubscript(info: DayInfo): string {
    return getClosedDisplay(this.translate.currentLang, info.closed, false);
  }

  dayForUrl(day: moment.Moment): string {
    return dayToIso(day);
  }
}

interface DayInfo {
  day: moment.Moment;
  closed: ClosingDay | null;
}