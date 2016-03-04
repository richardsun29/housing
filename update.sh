#!/bin/bash

cd /home/code/sites/bruinmobile/dev/housing/housing
git pull
sassc scss/ionic.app.scss --style compressed > www/css/app.min.css
