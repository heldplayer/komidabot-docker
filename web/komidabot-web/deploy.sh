#!/bin/bash

ng build --aot --prod && time rsync -rog --chown=www-data:www-data --delete dist/komidabot-web/ root@heldplayer.blue:/var/www/komidabot.xyz/
