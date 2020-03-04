import {Component, Input, OnInit} from '@angular/core';
import {FoodType, foodTypeIcons, Menu, MenuItem} from "../../entities";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {CampusService} from "../../campus.service";
import * as moment from "moment";
import {dayToDisplay} from "../../utils";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-menu-display',
  templateUrl: './menu-display.component.html',
  styleUrls: ['./menu-display.component.scss']
})
export class MenuDisplayComponent implements OnInit {

  @Input()
  campus: string;

  @Input()
  menu: Menu;

  @Input()
  day: moment.Moment;

  get language() {
    return this.translate.currentLang;
  }

  constructor(
    private campusService: CampusService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
  }

  getCampusName(campus: string): Observable<string> {
    return this.campusService.getCampus(campus)
      .pipe(
        map(campus => campus.name),
        startWith(campus)
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
      return item.translation['nl_BE'] || item.translation['nl_NL'] || '???';
    } else {
      // FIXME: English translations aren't available sometimes
      return item.translation['en_US'] || item.translation['nl_BE'] || item.translation['nl_NL'];
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
