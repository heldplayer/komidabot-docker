import {Component, Input} from '@angular/core';
import {ApiResponse, ClosedDay, FoodType, foodTypeIcons, Menu, MenuItem} from "../../entities";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {CampusService} from "../../campus.service";
import * as moment from "moment";
import {dayToIso, getNextWeekDay, getPreviousWeekDay} from "../../utils";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-menu-display',
  templateUrl: './menu-display.component.html',
  styleUrls: ['./menu-display.component.scss']
})
export class MenuDisplayComponent {

  menuInfo$: Observable<ApiResponse<MenuInfo>>;
  campusName$: Observable<string>;

  previousDay: moment.Moment;
  nextDay: moment.Moment;

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
    this._day = value;
    this.previousDay = getPreviousWeekDay(value);
    this.nextDay = getNextWeekDay(value);

    this.daySubject.next(value);
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
    // TODO: Check for closing day and display this here as well!

    this.menuInfo$ = combineLatest([this.campusSubject.asObservable(), this.daySubject.asObservable()])
      .pipe(
        distinctUntilChanged((p, n) => p[0] === n[0] && p[1].isSame(n[1], 'day')),
        switchMap(data => {
          const campus: string = data[0];
          const day: moment.Moment = data[1];

          return ApiResponse.combineLatest([
            this.campusService.getMenuForDay(campus, day),
            this.campusService.getCampusClosed(day, campus)
          ]);
        }),
        ApiResponse.pipe(
          map(data => {
            const menu: Menu = data[0];
            const closed: ClosedDay | null = data[1];

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
      // FIXME
      return item.translation['nl'] || 'Missing translation';
    } else {
      // FIXME: English translations aren't available sometimes
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
    if (menuInfo.closed) {
      // return 'Closed for X (DD-MM-YYYY - DD-MM-YYYY)';
      if (this.translate.currentLang == 'nl') {
        // FIXME
        return menuInfo.closed.reason['nl'] || 'Gesloten';
      } else {
        return menuInfo.closed.reason['en'] || 'Closed';
      }
      // return 'Closed for X (DD\xa0Month - DD\xa0Month)'; // Alternatively. \xa0 == non breaking space
    }
    // return 'Open from 11:45 to 13:45';
    // return 'Open from Monday to Friday';
    // TODO: Opening hours
    return '';
  }
}

interface MenuInfo {
  menu: Menu;
  closed: ClosedDay | null;
}
