(function () {
  'use strict';

  const prevAddEventListener = self.addEventListener;
  let skipHandler = true;
  self.addEventListener = (type, handler, ...rest) => {
    if (skipHandler && type === 'notificationclick') {
      console.log('Skipping event handler for "notificationclick"', handler);
      return;
    }
    prevAddEventListener.call(self, type, handler, ...rest);
  };

  importScripts('/ngsw-worker.js');

  // TODO: Handle push messages

  function notificationClickHandler(notification, action) {
    // FIXME: This doesn't seem to be behaving in any logical way as to whether it wants to close the notification or
    //        open the browser window, sometimes it does both, sometimes neither, and sometimes just one of them
    notification.close();
    if (clients.openWindow) {
      return clients.openWindow('/pwa_start')
        .then((client) => {
          console.log('Open window result:', client);
        }, (err) => {
          console.log('Open window error:', err);
        });
    }
  }

  skipHandler = false;
  self.addEventListener('notificationclick', (event) => {
    const result = notificationClickHandler(event.notification, event.action);
    if (result) {
      event.waitUntil(result);
    }
  });
}());
