import * as moment from "moment";
import {ClosingDay} from "./entities";
import {formatDate} from "@angular/common";
import {OperatorFunction, pipe} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

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

export function getClosedDisplay(translateService: TranslateService, closedInfo?: ClosingDay | null,
                                 showDates = false): string {
  if (!closedInfo) {
    return '';
  }

  let datesInfo = '';
  if (showDates) {
    const firstDayStr = closedInfo.first_day;
    const lastDayStr = closedInfo.last_day;

    if (firstDayStr !== lastDayStr) {
      const firstDay = moment(firstDayStr);
      const lastDay = lastDayStr == null ? null : moment(lastDayStr);

      const firstDayFormatted = formatDate(firstDay.toDate(), 'd\xa0MMMM', translateService.currentLang);

      if (lastDay != null) {
        const lastDayFormatted = formatDate(lastDay.toDate(), 'd\xa0MMMM', translateService.currentLang);
        datesInfo = ` (${firstDayFormatted} - ${lastDayFormatted})`;
      } else {
        const unknownEndStr = translateService.instant('CLOSING_DATE.NO_END_DATE');
        datesInfo = ` (${firstDayFormatted} - ${unknownEndStr})`;
      }

    }
  }

  return (closedInfo.reason[translateService.currentLang] || translateService.instant('CLOSING_DATE.UNKNOWN_REASON'))
    + datesInfo;
}

export function unsafeCast<T>(): OperatorFunction<any, T> {
  return pipe();
}
