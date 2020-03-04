export type Translation = Record<string, string>

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
//       Especially for PASTA_VEGAN, maybe change the meat to green? :P
export const foodTypeIcons = {
  [FoodType.SOUP]: '1f375',
  [FoodType.MEAT]: '1f969',
  [FoodType.VEGAN]: '1f96c',
  [FoodType.GRILL]: '1f356',
  [FoodType.PASTA_MEAT]: '1f35d',
  [FoodType.PASTA_VEGAN]: '1f35d',
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
