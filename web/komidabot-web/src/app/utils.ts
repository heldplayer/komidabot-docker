import * as moment from "moment";

export function dayToIso(day: moment.Moment): string {
  return day.format('YYYY-MM-DD');
}

export function getNextWeekDay(day: moment.Moment): moment.Moment {
  if (day.isoWeekday() >= 5) {
    return day.clone().day(8);
  }
  return day.clone().add(1, 'day');
}

export function getPreviousWeekDay(day: moment.Moment): moment.Moment {
  if (day.isoWeekday() <= 1) {
    return day.clone().day(-2);
  }
  return day.clone().subtract(1, 'day');
}
