import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {ActiveClosingDays, ApiResponse, Campus, CampusList, ClosedDay, ClosingDays, Menu} from "./entities";
import {AppConfigService} from "./app-config.service";
import {concatMap, map, shareReplay, tap} from "rxjs/operators";
import * as moment from 'moment';

const httpGetOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class CampusService {
  private campuses$: Observable<ApiResponse<Campus[]>>;
  private activeClosingDaysCache = new Map<string, Observable<ApiResponse<ActiveClosingDays>>>(); // Day -> closed campuses
  private closedDaysCache = new Map<string, Map<string, Observable<ApiResponse<ClosedDay | null>>>>(); // campus -> day -> closed
  private menuCache = new Map<string, Map<string, Observable<ApiResponse<Menu>>>>(); // campus -> day -> menu

  constructor(
    private configService: AppConfigService,
    private http: HttpClient,
  ) {

    this.campuses$ = this.configService.config.pipe(
      concatMap(config => {
        return this.http.get<CampusList>(`${config.api_endpoint}campus`, httpGetOptions)
          .pipe(
            tap((result) => console.log('getting all campuses w/ response =', result))
          );
      }),
      map((value: CampusList) => value.campuses),
      ApiResponse.convert<Campus[]>(),
      shareReplay(1),
    );
  }

  getAllCampuses(): Observable<ApiResponse<Campus[]>> {
    return this.campuses$;
  }

  getCampus(short_name: string): Observable<ApiResponse<Campus>> {
    return this.campuses$.pipe(
      ApiResponse.pipe(
        map(campuses => <Campus>campuses.find(campus => campus.short_name === short_name))
      ),
    );
  }

  getActiveClosingDays(day: moment.Moment): Observable<ApiResponse<ActiveClosingDays>> {
    const dayString = day.format('YYYY-MM-DD');

    let cachedValue = this.activeClosingDaysCache.get(dayString);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    cachedValue = this.configService.config.pipe(
      concatMap(config => {
        const url = `${config.api_endpoint}campus/closing_days/${dayString}`;
        return this.http.get<ActiveClosingDays>(url, httpGetOptions)
          .pipe(
            tap((result) => console.log('getting all campus closing days w/ response =', result))
          );
      }),
      ApiResponse.convert<ActiveClosingDays>(),
      shareReplay(1),
    );

    this.activeClosingDaysCache.set(dayString, cachedValue);

    return cachedValue;
  }

  /**
   * Gets information about closings for a week.
   * @param day A day of the week.
   * @param campus The campus to query.
   * @return An observable detailing which days are open and which are closed for a week.
   */
  getWeekClosingDays(day: moment.Moment, campus: string): Observable<ApiResponse<(ClosedDay | null)[]>> {
    const monday = day.startOf('isoWeek'); // Monday
    const friday = day.clone().add(4, 'days'); // Friday

    const mondayString = monday.format('YYYY-MM-DD');
    const fridayString = friday.format('YYYY-MM-DD');

    let campusCache = this.closedDaysCache.get(campus);
    if (!campusCache) {
      campusCache = new Map<string, Observable<ApiResponse<ClosedDay | null>>>();
      this.closedDaysCache.set(campus, campusCache);
    }

    let observables: Observable<ApiResponse<ClosedDay | null>>[] = [];

    for (let i = 0; i <= 4; i++) {
      const day = monday.clone().add(i, 'days');
      const dayString = day.format('YYYY-MM-DD');
      const observable = campusCache.get(dayString);
      if (observable) {
        observables.push(observable);
      } else {
        break;
      }
    }

    if (observables.length != 5) {
      observables = [];

      const data = this.configService.config.pipe(
        concatMap(config => {
          const url = `${config.api_endpoint}campus/${campus}/closing_days/${mondayString}/${fridayString}`;
          return this.http.get<ClosingDays>(url, httpGetOptions)
            .pipe(
              tap((result) => console.log(`getting campus ${campus} closing days w/ response =`, result)),
            );
        }),
        map((value: ClosingDays) => value.closing_days[campus]),
        // tap(x => console.log('getWeekClosingDays request gives', x)),
        ApiResponse.convert<ClosedDay[]>(),
        shareReplay(1),
      );

      for (let i = 0; i <= 4; i++) {
        const day = monday.clone().add(i, 'days');
        const dayString = day.format('YYYY-MM-DD');
        const observable = data.pipe(
          ApiResponse.pipe(
            map((value: ClosedDay[]) => value.find(value1 => value1.date === dayString) || null),
          )
        );
        campusCache.set(dayString, observable);
        observables.push(observable);
      }
    }

    return ApiResponse.combineLatest(observables)
      .pipe(
        // tap(x => console.log('getWeekClosingDays gives', x)),
      );
  }

  getMenuForDay(campus: string, day: moment.Moment): Observable<ApiResponse<Menu>> {
    const dayString = day.format('YYYY-MM-DD');

    let campusCache = this.menuCache.get(campus);
    if (!campusCache) {
      campusCache = new Map<string, Observable<ApiResponse<Menu>>>();
      this.menuCache.set(campus, campusCache);
    }

    let observable = campusCache.get(dayString);
    if (!observable) {
      observable = this.configService.config.pipe(
        concatMap(config => {
          const url = `${config.api_endpoint}campus/${campus}/menu/${dayString}`;
          return this.http.get<Menu>(url, httpGetOptions)
            .pipe(
              tap((result) => console.log('getting menu w/ response =', result))
            );
        }),
        // tap(x => console.log('getMenuForDay request gives', x)),
        ApiResponse.convert<Menu>(),
        shareReplay(1)
      );

      campusCache.set(dayString, observable);
    }

    return observable;
  }
}
