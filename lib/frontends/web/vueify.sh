#!/bin/sh
browserify -t vueify js/pages/lab.js -o static/js/lab.js
browserify -t vueify js/pages/main.js -o static/js/main.js
browserify -t vueify js/pages/admin.js -o static/js/admin.js