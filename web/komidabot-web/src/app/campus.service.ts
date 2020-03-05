import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {
  ApiResponse,
  Campus,
  CampusListResponse,
  ClosingDay,
  ClosingDays,
  ClosingDaysResponse, DayClosings,
  MenuItem,
  MenuResponse
} from "./entities";
import {AppConfigService} from "./app-config.service";
import {concatMap, debounceTime, map, pluck, shareReplay, switchMap, tap} from "rxjs/operators";
import * as moment from 'moment';
import {unsafeCast} from "./utils";

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
  private menuCache = new Map<string, Map<string, Observable<ApiResponse<MenuItem[]>>>>(); // campus -> day -> menu
  private closedDaysRequestCache = new Map<string, Observable<ApiResponse<ClosingDaysResponse>>>(); // day -> response
  private closedDaysCache = new Map<string, Map<string, Observable<ApiResponse<ClosingDay | null>>>>(); // campus -> day -> closed

  constructor(
    private configService: AppConfigService,
    private http: HttpClient,
  ) {

    this.campuses$ = this.configService.config.pipe(
      concatMap(config => {
        return this.http.get<CampusListResponse>(`${config.api_endpoint}campus`, httpGetOptions)
          .pipe(
            tap((result) => console.log('getting all campuses w/ response =', result))
          );
      }),
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

  /**
   * Gets information about closings for a week.
   * @param day A day of the week.
   * @return An observable detailing which days are open and which are closed for a week.
   */
  getAllWeekClosingDays(day: moment.Moment): Observable<ApiResponse<ClosingDaysResponse>> {
    const monday = day.clone().startOf('isoWeek'); // Monday
    const mondayString = monday.format('YYYY-MM-DD');

    let cachedValue = this.closedDaysRequestCache.get(mondayString);
    if (cachedValue) {
      return cachedValue;
    }

    cachedValue = this.campuses$.pipe(
      ApiResponse.awaitReady(),
      switchMap((campuses: Campus[]) => {

        const data = this.configService.config.pipe(
          concatMap(config => {
            const url = `${config.api_endpoint}campus/closing_days/${mondayString}`;
            return this.http.get<ClosingDaysResponse>(url, httpGetOptions)
              .pipe(
                tap((result) => console.log(`getting all campus closing days w/ response =`, result)),
              );
          }),
          // tap(x => console.log('getWeekClosingDays request gives', x)),
          ApiResponse.convert<ClosingDaysResponse>(),
          shareReplay(1),
        );

        campuses.forEach(campus => {
          const shortName = campus.short_name;
          let campusCache = this.closedDaysCache.get(shortName);
          if (!campusCache) {
            campusCache = new Map<string, Observable<ApiResponse<ClosingDay | null>>>();
            this.closedDaysCache.set(shortName, campusCache);
          }

          for (let i = 0; i <= 4; i++) {
            const day = monday.clone().add(i, 'days');
            const dayString = day.format('YYYY-MM-DD');
            const observable = data.pipe(
              ApiResponse.pipe(
                map((closingDays) => closingDays[shortName]),
                map((closingDays) => closingDays[i]),
              )
            );
            campusCache.set(dayString, observable);
          }
        });

        return data;
      }),
      shareReplay(1),
    );

    this.closedDaysRequestCache.set(mondayString, cachedValue);

    return cachedValue;
  }

  /**
   * Gets information about closings for a week.
   * @param day A day of the week.
   * @param campus The campus to query.
   * @return An observable detailing which days are open and which are closed for a week.
   */
  getWeekClosingDays(day: moment.Moment, campus: string): Observable<ApiResponse<ClosingDays>> {
    const monday = day.clone().startOf('isoWeek'); // Monday
    const mondayString = monday.format('YYYY-MM-DD');

    let campusCache = this.closedDaysCache.get(campus);
    if (!campusCache) {
      campusCache = new Map<string, Observable<ApiResponse<ClosingDay | null>>>();
      this.closedDaysCache.set(campus, campusCache);
    }

    let observables: Observable<ApiResponse<ClosingDay | null>>[] = [];

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
          const url = `${config.api_endpoint}campus/${campus}/closing_days/${mondayString}`;
          return this.http.get<ClosingDaysResponse>(url, httpGetOptions)
            .pipe(
              tap((result) => console.log(`getting campus ${campus} closing days w/ response =`, result)),
            );
        }),
        map((value: ClosingDaysResponse) => value[campus] || [null, null, null, null, null]),
        // tap(x => console.log('getWeekClosingDays request gives', x)),
        ApiResponse.convert<ClosingDays>(),
        shareReplay(1),
      );

      for (let i = 0; i <= 4; i++) {
        const day = monday.clone().add(i, 'days');
        const dayString = day.format('YYYY-MM-DD');
        const observable = data.pipe(
          ApiResponse.pipe(
            pluck(i)
          )
        );
        campusCache.set(dayString, observable);
        observables.push(observable);
      }
    }

    return ApiResponse.combineLatest(observables)
      .pipe(
        unsafeCast(),
        // tap(x => console.log('getWeekClosingDays gives', x)),
      );
  }

  getClosedCampuses(day: moment.Moment): Observable<ApiResponse<DayClosings>> {
    return this.getAllWeekClosingDays(day)
      .pipe(
        ApiResponse.pipe(
          map((closingDays) => {
            const result = new Map<string, ClosingDay | null>();

            Object.keys(closingDays).forEach(campus => {
              result.set(campus, closingDays[campus][day.isoWeekday() - 1]);
            });

            return result;
          }),
        )
      );
  }

  getCampusClosed(day: moment.Moment, campus: string): Observable<ApiResponse<ClosingDay | null>> {
    this.getWeekClosingDays(day, campus);

    const dayString = day.format('YYYY-MM-DD');

    const campusCache = this.closedDaysCache.get(campus);

    return campusCache?.get(dayString) as Observable<ApiResponse<ClosingDay | null>>;
  }

  getMenuForDay(day: moment.Moment, campus: string): Observable<ApiResponse<MenuItem[]>> {
    const dayString = day.format('YYYY-MM-DD');

    let campusCache = this.menuCache.get(campus);
    if (!campusCache) {
      campusCache = new Map<string, Observable<ApiResponse<MenuItem[]>>>();
      this.menuCache.set(campus, campusCache);
    }

    let observable = campusCache.get(dayString);
    if (!observable) {
      observable = this.configService.config.pipe(
        concatMap(config => {
          const url = `${config.api_endpoint}campus/${campus}/menu/${dayString}`;
          return this.http.get<MenuResponse>(url, httpGetOptions)
            .pipe(
              tap((result) => console.log('getting menu w/ response =', result))
            );
        }),
        // tap(x => console.log('getMenuForDay request gives', x)),
        ApiResponse.convert<MenuItem[]>(),
        shareReplay(1)
      );

      campusCache.set(dayString, observable);
    }

    return observable;
  }
}
