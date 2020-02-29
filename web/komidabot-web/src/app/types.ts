import * as moment from 'moment';

export interface Menu {
  day: moment.Moment;
  items: MenuItem[];
}

export enum MenuItemType {
  SOUP = 1,
  MEAT = 2,
  VEGAN = 3,
  GRILL = 4,
  PASTA_MEAT = 5,
  PASTA_VEGAN = 6,
  SALAD = 7,
  SUB = 8,
}

export interface MenuItem {
  type: MenuItemType;
  description: string;
  price_students: string;
  price_staff?: string;
}

export interface Campus {
  id: number;
  short_name: string;
  name: string;
}
