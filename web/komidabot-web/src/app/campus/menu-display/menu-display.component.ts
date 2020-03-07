import {Component, Input} from '@angular/core';
import {ApiResponse, ClosingDay, FoodType, foodTypeIcons, MenuItem} from "../../entities";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {CampusService} from "../../campus.service";
import * as moment from "moment";
import {dayToIso, getClosedDisplay, getNextWeekDay, getPreviousWeekDay} from "../../utils";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-menu-display',
  templateUrl: './menu-display.component.html',
  styleUrls: ['./menu-display.component.scss']
})
export class MenuDisplayComponent {

  menuInfo$: Observable<ApiResponse<MenuInfo>>;
  campusName$: Observable<string>;

  weekStart: moment.Moment;
  previousDay: moment.Moment;
  nextDay: moment.Moment | null;

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

  // INPUT: day
  private daySubject = new ReplaySubject<moment.Moment>(1);
  private _day: moment.Moment;

  @Input()
  set day(value: moment.Moment) {
    this.weekStart = value.clone().startOf('isoWeek');

    this._day = value.clone();
    this.previousDay = getPreviousWeekDay(this._day);
    if (this.weekStart > moment() && this._day.isoWeekday() >= 5) {
      this.nextDay = null;
    } else {
      this.nextDay = getNextWeekDay(this._day);
    }

    this.daySubject.next(this._day);
  }

  get day(): moment.Moment {
    return this._day;
  }

  get language() {
    return this.translate.currentLang;
  }

  constructor(
    private campusService: CampusService,
    private translate: TranslateService,
  ) {
    this.menuInfo$ = combineLatest([this.campusSubject.asObservable(), this.daySubject.asObservable()])
      .pipe(
        distinctUntilChanged((p, n) => p[0] === n[0] && p[1].isSame(n[1], 'day')),
        switchMap(data => {
          const campus: string = data[0];
          const day: moment.Moment = data[1];

          return ApiResponse.combineLatest([
            this.campusService.getMenuForDay(day, campus),
            this.campusService.getCampusClosed(day, campus)
          ]);
        }),
        ApiResponse.pipe(
          map(data => {
            const menu: MenuItem[] = data[0];
            const closed: ClosingDay | null = data[1];

            return {
              menu: menu,
              closed: closed
            };
          })
        )
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

  dayForUrl(day: moment.Moment): string {
    return dayToIso(day);
  }

  getIconURL(item: MenuItem): string {
    return `/assets/twemoji/${foodTypeIcons[<FoodType>item.food_type]}.png`;
  }

  getTranslation(item: MenuItem): string {
    if (this.translate.currentLang == 'nl') {
      return item.translation['nl'] || 'Missing translation';
    } else {
      return item.translation['en'] || item.translation['nl'] || 'Missing translation';
    }
  }

  getPriceDisplay(item: MenuItem): string {
    if (item.price_students) {
      if (item.price_staff) {
        return `(${item.price_students}\xa0/\xa0${item.price_staff})`;
      }
      return `(${item.price_students})`;
    } else {
      return '';
    }
  }

  getClosedDisplay(menuInfo: MenuInfo): string {
    return getClosedDisplay(this.translate.currentLang, menuInfo.closed, true);
  }

  get isMenuProvisional(): boolean {
    const now = moment();
    return this.weekStart > now && now.isoWeekday() <= 4;
  }
}

interface MenuInfo {
  menu: MenuItem[];
  closed: ClosingDay | null;
}
