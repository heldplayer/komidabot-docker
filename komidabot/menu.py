import datetime
from typing import Optional

import komidabot.localisation as localisation
import komidabot.models as models
import komidabot.translation as translation
import komidabot.util as util


def get_menu_line(menu_item: models.MenuItem, translator: translation.TranslationService, locale: str = None) -> str:
    translation_obj = menu_item.get_translation(locale, translator)

    if not menu_item.price_staff:
        price_str = models.MenuItem.format_price(menu_item.price_students)
    else:
        price_str = '{} / {}'.format(models.MenuItem.format_price(menu_item.price_students),
                                     models.MenuItem.format_price(menu_item.price_staff))

    return '{} {} ({})'.format(models.course_icons_matrix[menu_item.course_type][menu_item.course_sub_type],
                               translation_obj.translation, price_str)


def prepare_menu_text(campus: models.Campus, date: datetime.date, translator: translation.TranslationService,
                      locale: str) -> 'Optional[str]':
    return get_menu_text(models.Menu.get_menu(campus, date), translator, locale)


def get_menu_text(menu: Optional[models.Menu], translator: translation.TranslationService,
                  locale: str) -> 'Optional[str]':
    if menu is None:
        return None

    date_str = util.date_to_string(locale, menu.menu_day)

    result = [localisation.REPLY_MENU_START(locale).format(campus=menu.campus.name, date=date_str), '']

    # if len(menu.menu_items) < 6:
    #     result.insert(1, localisation.REPLY_MENU_INCOMPLETE(locale))

    try:
        for item in menu.menu_items:
            item: models.MenuItem
            result.append(get_menu_line(item, translator, locale))
    except Exception:
        print('Failed translating to {}'.format(locale), flush=True)
        raise

    return '\n'.join(result)


def get_short_menu_text(menu: Optional[models.Menu], translator: translation.TranslationService,
                        locale: str, *course_types: models.CourseType) -> 'Optional[str]':
    if menu is None:
        return None

    result = []

    try:
        for item in menu.menu_items:
            item: models.MenuItem
            if course_types and item.course_type in course_types:
                result.append(get_menu_line(item, translator, locale))
    except Exception:
        print('Failed translating to {}'.format(locale), flush=True)
        raise

    return '\n'.join(result)
