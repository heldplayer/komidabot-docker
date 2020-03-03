import {Component, Input, OnInit} from '@angular/core';
import {FoodType, foodTypeIcons, Menu, MenuItem} from "../../entities";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {CampusService} from "../../campus.service";
import * as moment from "moment";
import {dayToDisplay, dayToIso} from "../../utils";

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

  constructor(
    private campusService: CampusService,
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

  dayForUrl(day: moment.Moment): string {
    return dayToIso(day);
  }

  dayForDisplay(day: moment.Moment) {
    return dayToDisplay(day);
  }

  getIconURL(item: MenuItem): string {
    // TODO: Store icons locally
    return `https://twemoji.maxcdn.com/v/latest/72x72/${foodTypeIcons[<FoodType>item.food_type]}.png`;
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
