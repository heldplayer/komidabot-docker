import {catchError, distinctUntilChanged, filter, map, startWith} from "rxjs/operators";
import {combineLatest, merge, Observable, OperatorFunction, pipe} from "rxjs";

export type Translation = Record<string, string>

export const enum ResponseState {
  LOADING,
  LOADED,
  ERROR
}

export class ApiResponse<T> {
  constructor(
    public state: ResponseState,
    public response: T,
  ) {
  }

  public get isLoading() {
    return this.state === ResponseState.LOADING;
  }

  public get isLoaded() {
    return this.state === ResponseState.LOADED;
  }

  public get isErrored() {
    return this.state === ResponseState.ERROR;
  }

  public static initial<T>(): OperatorFunction<ApiResponse<T>, ApiResponse<T>> {
    return startWith(new ApiResponse<T>(ResponseState.LOADING, <T><unknown>null));
  }

  public static of<T>(): OperatorFunction<T, ApiResponse<T>> {
    return map((value: T) => new ApiResponse<T>(ResponseState.LOADED, value));
  }

  public static error<T>(): OperatorFunction<ApiResponse<T>, ApiResponse<T>> {
    return catchError((err) => [new ApiResponse<T>(ResponseState.ERROR, <T><unknown>null)]);
  }

  public static awaitReady<T>(): OperatorFunction<ApiResponse<T>, T> {
    return pipe(
      filter(response => response.state === ResponseState.LOADED),
      map(response => response.response),
    );
  }

  public static pipe<T, R>(...fns: OperatorFunction<T, R>[]): OperatorFunction<ApiResponse<T>, ApiResponse<R>> {
    const loadedPath: OperatorFunction<ApiResponse<T>, ApiResponse<R>> = pipe(
      filter(response => response.state === ResponseState.LOADED),
      map(response => response.response),
      (obs: Observable<any>) => <Observable<R>>(<OperatorFunction<any, any>[]>fns).reduce((prev, fn) => fn(prev), obs),
      map(value => new ApiResponse(ResponseState.LOADED, value))
    );
    const unloadedPath: OperatorFunction<ApiResponse<T>, ApiResponse<R>> = pipe(
      filter(response => response.state !== ResponseState.LOADED),
      map(response => <ApiResponse<R>><ApiResponse<unknown>>response)
    );
    return (obs: Observable<ApiResponse<T>>) => merge(loadedPath(obs), unloadedPath(obs));
  }

  public static combineLatest<T1>(
    sources: [Observable<ApiResponse<T1>>]
  ): Observable<ApiResponse<[T1]>>;

  public static combineLatest<T1, T2>(
    sources: [Observable<ApiResponse<T1>>, Observable<ApiResponse<T2>>]
  ): Observable<ApiResponse<[T1, T2]>>;

  public static combineLatest<T1, T2, T3>(
    sources: [Observable<ApiResponse<T1>>, Observable<ApiResponse<T2>>, Observable<ApiResponse<T3>>]
  ): Observable<ApiResponse<[T1, T2, T3]>>;

  public static combineLatest<T>(sources: Observable<ApiResponse<T>>[]): Observable<ApiResponse<T[]>>;

  public static combineLatest(sources: Observable<ApiResponse<any>>[]): Observable<ApiResponse<any[]>> {
    return combineLatest(sources).pipe(
      map((responses: ApiResponse<any>[]) => {
        if (responses.find(response => response.state === ResponseState.ERROR)) {
          return new ApiResponse(ResponseState.ERROR, <any[]><unknown>null);
        } else if (responses.find(response => response.state === ResponseState.LOADING)) {
          return new ApiResponse(ResponseState.LOADING, <any[]><unknown>null);
        }
        return new ApiResponse(ResponseState.LOADED, responses.map(response => response.response));
      }),
      distinctUntilChanged((p, n) => n.state !== ResponseState.LOADED && p.state === n.state),
    );
  }

  public static convert<T>(withInitial: boolean = true): OperatorFunction<T, ApiResponse<T>> {
    if (withInitial) {
      return pipe(
        ApiResponse.of<T>(),
        ApiResponse.error<T>(),
        ApiResponse.initial<T>(),
      );
    } else {
      return pipe(
        ApiResponse.of<T>(),
        ApiResponse.error<T>(),
      );
    }
  }
}

export interface Campus {
  id: number;
  name: string;
  short_name: string;
  // TODO: Needs opening hours
}

export interface CampusList {
  campuses: Campus[];
}

export interface ClosedDay {
  date: string;
  reason: Translation;
}

export interface ClosingDays {
  closing_days: { [key: string]: ClosedDay[] };
}

export interface ActiveClosedDay {
  first_day: string;
  last_day: string;
  reason: Translation;
}

export interface ActiveClosingDays {
  closing_days: {
    [key: string]: ActiveClosedDay
  };
}

export const enum FoodType {
  SOUP = 1,
  MEAT = 2,
  VEGAN = 3,
  GRILL = 4,
  PASTA_MEAT = 5,
  PASTA_VEGAN = 6,
  SALAD = 7,
  SUB = 8,
}

// TODO: Create custom icons?
export const foodTypeIcons = {
  [FoodType.SOUP]: '1f375-alt',
  [FoodType.MEAT]: '1f32e',
  [FoodType.VEGAN]: '1f966',
  [FoodType.GRILL]: '1f969',
  [FoodType.PASTA_MEAT]: '1f35d',
  [FoodType.PASTA_VEGAN]: '1f35d-Dvegan-alt-alt-dark',
  [FoodType.SALAD]: '1f957',
  [FoodType.SUB]: '1f956',
};

export interface MenuItem {
  food_type: number;
  translation: Translation;
  price_students?: string;
  price_staff?: string;
}

export interface Menu {
  menu: MenuItem[];
}
