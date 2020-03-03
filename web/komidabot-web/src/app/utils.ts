import * as moment from "moment";

export function dayToIso(day: moment.Moment): string {
  return day.format('YYYY-MM-DD');
}

export function dayToDisplay(day: moment.Moment) {
  let weekday: string;
  let month: string;
  switch (day.isoWeekday()) {
    case 1:
      weekday = 'Maandag';
      break;
    case 2:
      weekday = 'Dinsdag';
      break;
    case 3:
      weekday = 'Woensdag';
      break;
    case 4:
      weekday = 'Donderdag';
      break;
    case 5:
      weekday = 'Vrijdag';
      break;
    case 6:
      weekday = 'Zaterdag';
      break;
    case 7:
      weekday = 'Zondag';
      break;
    default:
      weekday = '???';
  }
  switch (day.month()) {
    case 0:
      month = 'Januari';
      break;
    case 1:
      month = 'Februari';
      break;
    case 2:
      month = 'Maart';
      break;
    case 3:
      month = 'April';
      break;
    case 4:
      month = 'Mei';
      break;
    case 5:
      month = 'Juni';
      break;
    case 6:
      month = 'Juli';
      break;
    case 7:
      month = 'Augustus';
      break;
    case 8:
      month = 'September';
      break;
    case 9:
      month = 'October';
      break;
    case 10:
      month = 'November';
      break;
    case 11:
      month = 'December';
      break;
    default:
      month = '???';
  }
  return `${weekday} ${day.date()} ${month}`
}
