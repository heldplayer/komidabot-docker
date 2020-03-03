import * as moment from 'moment';

export interface Menu {
  day: moment.Moment;
  items: MenuItem[];
}

export interface MenuItem {
  type: number;
  description: string;
  price_students: string;
  price_staff?: string;
}

export interface Campus {
  id: number;
  short_name: string;
  name: string;
}
