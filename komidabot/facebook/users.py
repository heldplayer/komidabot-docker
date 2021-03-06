from typing import Optional, Union

import komidabot.facebook.constants as fb_constants
import komidabot.messages as messages
import komidabot.models as models
import komidabot.users as users
from komidabot.app import get_app
from komidabot.facebook.messages import MessageHandler as FBMessageHandler

__all__ = ['User', 'UserManager']


class UserManager(users.UserManager):
    def __init__(self):
        self.message_handler = FBMessageHandler()

    # def get_subscribed_users(self, day: models.Day) -> 'List[users.User]':
    #     # TODO: Starting March 4th 2020, facebook subscriptions will no longer be available
    #     #       https://developers.facebook.com/docs/messenger-platform/policy/policy-overview/
    #     # return super().get_subscribed_users(day)
    #     return []

    def get_user(self, user: 'Union[users.UserId, models.AppUser]', **kwargs) -> 'User':
        if isinstance(user, models.AppUser):
            return User(self, user.internal_id)

        if user.provider != fb_constants.PROVIDER_ID:
            raise ValueError('User id is not for {}'.format(fb_constants.PROVIDER_ID))

        # TODO: This probably could use more checks or something
        #       For example: check if there is a subscription
        return User(self, user.id)

    def initialise(self):
        import komidabot.facebook.postbacks as postbacks

        app = get_app()
        if app.config.get('TESTING') or app.config.get('DISABLED'):
            return

        data = postbacks.generate_postback_data(True, app.config.get('PRODUCTION'))
        app.bot_interfaces['facebook']['api_interface'].post_profile_api(data)

    def get_identifier(self):
        return fb_constants.PROVIDER_ID


class User(users.User):
    def __init__(self, manager: UserManager, id_str: str):
        self._manager = manager
        self._id = id_str

    def get_locale(self) -> 'Optional[str]':
        stored_value = super().get_locale()

        if not stored_value:
            return get_app().bot_interfaces['facebook']['api_interface'].lookup_locale(self._id)

        return stored_value

    def get_provider_name(self) -> 'str':
        return fb_constants.PROVIDER_ID

    def get_internal_id(self) -> 'str':
        return self._id

    def supports_subscription_channel(self, channel: str) -> bool:
        # Facebook users cannot receive subscriptions anymore
        # This used to work by sending a message with "messaging_type" set to "NON_PROMOTIONAL_SUBSCRIPTION"
        # See https://developers.facebook.com/docs/messenger-platform/policy/policy-overview/
        return False

    def get_manager(self) -> UserManager:
        return self._manager

    def get_message_handler(self) -> messages.MessageHandler:
        return self._manager.message_handler

    def mark_message_seen(self):
        return get_app().bot_interfaces['facebook']['api_interface'].post_send_api({
            'recipient': {'id': self._id},
            'sender_action': 'mark_seen'
        })
