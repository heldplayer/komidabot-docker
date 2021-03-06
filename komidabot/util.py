import traceback
from functools import wraps
from typing import List, Tuple, TypeVar

import komidabot.localisation as localisation
import komidabot.translation as translation


def check_exceptions(fallback=None):
    def decorator(func):
        @wraps(func)
        def decorated_func(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                print('Exception raised while calling {}: {}'.format(func.__name__, e))
                traceback.print_tb(e.__traceback__)

                return fallback

        return decorated_func

    return decorator


T = TypeVar('T')


def get_list_diff(old_list: List[T], new_list: List[T]) -> Tuple[List[T], List[T], List[T]]:
    """
    Computes the difference between two lists.
    :param old_list: The old list.
    :param new_list: The new list.
    :return: A 3-tuple containing the following lists in order: items still present, items added, items removed
    """

    unchanged = [item for item in old_list if item in new_list]
    added = [item for item in new_list if item not in unchanged]
    removed = [item for item in old_list if item not in unchanged]

    assert len(unchanged) + len(removed) == len(old_list), 'List difference incorrect? {} + {} != {}'.format(unchanged,
                                                                                                             removed,
                                                                                                             old_list)
    assert len(unchanged) + len(added) == len(new_list), 'List difference incorrect? {} + {} != {}'.format(unchanged,
                                                                                                           added,
                                                                                                           new_list)

    return unchanged, added, removed


def date_to_string(locale: str, date):
    if locale == translation.LANGUAGE_ENGLISH:
        day_number = date.day
        if day_number == 1 or day_number == 21 or day_number == 31:
            suffix = 'st'
        elif day_number == 2 or day_number == 22:
            suffix = 'nd'
        elif day_number == 3 or day_number == 23:
            suffix = 'rd'
        else:
            suffix = 'th'

        return '{weekday} {day}{suffix} of {month}'.format(day=date.day, suffix=suffix,
                                                           month=localisation.MONTHS[date.month - 1](locale),
                                                           weekday=localisation.DAYS[date.weekday()](locale))
    elif locale == translation.LANGUAGE_DUTCH:
        return '{weekday} {day} {month}'.format(day=date.day, month=localisation.MONTHS[date.month - 1](locale),
                                                weekday=localisation.DAYS[date.weekday()](locale))
    else:
        return str(date)


def expected(name, value, *types):
    types_str = ' or '.join(type_obj.__name__ for type_obj in types)
    return ValueError('{} expected {} got {}'.format(name, types_str, type(value).__name__))


def expected_or_none(value, *types):
    return expected(value, *types, type(None))
