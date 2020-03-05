import {Component, Input} from '@angular/core';
import {ApiResponse, FoodType, foodTypeIcons, Menu, MenuItem} from "../../entities";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {CampusService} from "../../campus.service";
import * as moment from "moment";
import {dayToDisplay} from "../../utils";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-menu-display',
  templateUrl: './menu-display.component.html',
  styleUrls: ['./menu-display.component.scss']
})
export class MenuDisplayComponent {

  menu$: Observable<ApiResponse<Menu>>;
  campusName$: Observable<string>;

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
    this.menu$ = combineLatest([this.campusSubject.asObservable(), this.daySubject.asObservable()])
      .pipe(
        distinctUntilChanged((p, n) => p[0] === n[0] && p[1].isSame(p[1], 'week')),
        switchMap(data => {
          const campus: string = data[0];
          const day: moment.Moment = data[1];

          return this.campusService.getMenuForDay(campus, day);
        })
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

  dayForDisplay(day: moment.Moment) {
    return dayToDisplay(day);
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
}
