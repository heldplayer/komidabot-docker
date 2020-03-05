import * as moment from "moment";
import {ClosingDay} from "./entities";
import {formatDate} from "@angular/common";
import {OperatorFunction, pipe} from "rxjs";

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

export function getClosedDisplay(language: string, closedInfo?: ClosingDay | null, showDates = false): string {
  if (!closedInfo) {
    return '';
  }

  let datesInfo = '';
  if (showDates) {
    const firstDayStr = (closedInfo).first_day;
    const lastDayStr = (closedInfo).last_day;

    if (firstDayStr !== lastDayStr) {
      const firstDay = moment(firstDayStr);
      const lastDay = moment(lastDayStr);

      const firstDayFormatted = formatDate(firstDay.toDate(), 'd\xa0MMMM', language);
      const lastDayFormatted = formatDate(lastDay.toDate(), 'd\xa0MMMM', language);

      datesInfo = ` (${firstDayFormatted} - ${lastDayFormatted})`;
    }
  }

  if (language == 'nl') {
    return (closedInfo.reason['nl'] || 'Gesloten') + datesInfo;
  } else {
    return (closedInfo.reason['en'] || 'Closed') + datesInfo;
  }
}

export function unsafeCast<T>(): OperatorFunction<any, T> {
  return pipe();
}
