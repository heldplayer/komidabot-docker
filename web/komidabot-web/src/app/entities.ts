import {catchError, distinctUntilChanged, filter, map, startWith} from "rxjs/operators";
import {combineLatest, merge, Observable, OperatorFunction, pipe} from "rxjs";

export type Translation = Record<string, string>

export type CampusListResponse = Campus[];

export type MenuResponse = MenuItem[];

export type ClosingDays = [ClosingDay | null, ClosingDay | null, ClosingDay | null, ClosingDay | null, ClosingDay | null];
export type ClosingDaysResponse = Record<string, ClosingDays>;

export type DayClosings = Map<string, ClosingDay | null>;

export interface Campus {
  id: number;
  name: string;
  short_name: string;
  // TODO: Needs opening hours
}

export interface ClosingDay {
  first_day: string;
  last_day: string;
  reason: Translation;
}

export const enum CourseType {
  SOUP = 1,
  DAILY = 2,
  PASTA = 3,
  GRILL = 4,
  SALAD = 5,
  SUB = 6,
}

export const enum CourseSubType {
  NORMAL = 1,
  VEGAN = 2,
}

export const courseIcons = {
  [CourseType.SOUP]: {
    [CourseSubType.NORMAL]: '1f375-alt',
    [CourseSubType.VEGAN]: '1f375-alt-vegan',
  },
  [CourseType.DAILY]: {
    [CourseSubType.NORMAL]: '1f354',
    [CourseSubType.VEGAN]: '1f354-vegan',
  },
  [CourseType.PASTA]: {
    [CourseSubType.NORMAL]: '1f35d',
    [CourseSubType.VEGAN]: '1f35d-vegan',
  },
  [CourseType.GRILL]: {
    [CourseSubType.NORMAL]: '1f969',
    [CourseSubType.VEGAN]: '1f969-vegan',
  },
  [CourseType.SALAD]: {
    [CourseSubType.NORMAL]: '1f957',
    [CourseSubType.VEGAN]: '1f957-vegan',
  },
  [CourseType.SUB]: {
    [CourseSubType.NORMAL]: '1f956',
    [CourseSubType.VEGAN]: '1f956-vegan',
  },
};

export interface MenuItem {
  course_type: number;
  course_sub_type: number;
  translation: Translation;
  price_students?: string;
  price_staff?: string;
}

export const enum ResponseState {
  LOADING,
  LOADED,
  ERROR,
  WAITING_FOR_NETWORK
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

  public get isWaitingForNetwork() {
    // TODO: Properly implement the semantics surrounding this
    return this.state === ResponseState.WAITING_FOR_NETWORK;
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
      // tap(response => console.log('ApiResponse is ready:', response)),
    );
  }

  public static pipe<T>():
    OperatorFunction<ApiResponse<T>, ApiResponse<T>>;

  public static pipe<T, A>(fn1: OperatorFunction<T, A>):
    OperatorFunction<ApiResponse<T>, ApiResponse<A>>;

  public static pipe<T, A, B>(fn1: OperatorFunction<T, A>, fn2: OperatorFunction<A, B>):
    OperatorFunction<ApiResponse<T>, ApiResponse<B>>;

  public static pipe<T, A, B, C>(fn1: OperatorFunction<T, A>, fn2: OperatorFunction<A, B>, fn3: OperatorFunction<B, C>):
    OperatorFunction<ApiResponse<T>, ApiResponse<C>>;

  public static pipe<T, R>(...fns: OperatorFunction<any, any>[]): OperatorFunction<ApiResponse<T>, ApiResponse<R>> {
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

  public static startWith<T>(value: T): OperatorFunction<ApiResponse<T>, ApiResponse<T>> {
    return pipe(
      startWith(new ApiResponse(ResponseState.LOADED, value)),
      filter<ApiResponse<T>>(state => !state.isLoading),
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
