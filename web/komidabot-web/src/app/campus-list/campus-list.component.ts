import {Component} from '@angular/core';
import {Observable} from "rxjs";
import {ActiveClosedDay, ActiveClosingDays, ApiResponse, Campus} from "../entities";
import {CampusService} from "../campus.service";
import * as moment from "moment";
import {map} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {dayToIso} from "../utils";

@Component({
  selector: 'app-campus-list',
  templateUrl: './campus-list.component.html',
  styleUrls: ['./campus-list.component.scss']
})
export class CampusListComponent {

  campuses$: Observable<ApiResponse<Campus[]>>;
  closingDays$: Observable<ApiResponse<Map<string, ActiveClosedDay>>>;

  campusInfo$: Observable<ApiResponse<CampusInfo[]>>;

  constructor(
    private campusService: CampusService,
    private translate: TranslateService,
  ) {
    this.campuses$ = this.campusService.getAllCampuses();

    this.closingDays$ = this.campusService.getActiveClosingDays(moment())
      .pipe(
        ApiResponse.pipe(
          map((value: ActiveClosingDays) => {
            const result = new Map<string, ActiveClosedDay>();

            for (const campus in value.closing_days) {
              result.set(campus, value.closing_days[campus]);
            }

            return result;
          })
        ),
      );

    this.campusInfo$ = ApiResponse.combineLatest([this.campuses$, this.closingDays$])
      .pipe(
        ApiResponse.pipe(
          map(data => {
            const campuses = <Campus[]>data[0];
            const closingDays = <Map<string, ActiveClosedDay>>data[1];

            return campuses.map(value => ({
              campus: value,
              closed_info: closingDays.get(value.short_name),
            }));
          })
        )
      );
  }

  isCampusClosed(campusInfo: CampusInfo) {
    return 'closed_info' in campusInfo && campusInfo['closed_info'];
  }

  getCampusSubscript(campusInfo: CampusInfo): string {
    if (this.isCampusClosed(campusInfo)) {
      // return 'Closed for X (DD-MM-YYYY - DD-MM-YYYY)';
      if (this.translate.currentLang == 'nl') {
        // FIXME
        return campusInfo.closed_info?.reason['nl'] || 'Gesloten';
      } else {
        return campusInfo.closed_info?.reason['en'] || 'Closed';
      }
      // return 'Closed for X (DD\xa0Month - DD\xa0Month)'; // Alternatively. \xa0 == non breaking space
    }
    // return 'Open from 11:45 to 13:45';
    // return 'Open from Monday to Friday';
    // TODO: Opening hours
    return '';
  }

  dayForUrl(day: moment.Moment): string {
    return dayToIso(day);
  }

  get today(): moment.Moment {
    return moment();
  }
}

interface CampusInfo {
  campus: Campus;
  closed_info?: ActiveClosedDay;
}
