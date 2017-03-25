#!/bin/sh
browserify -t vueify js/lab.js -o static/js/lab.js
browserify -t vueify js/main.js -o static/js/main.js
browserify -t vueify js/admin.js -o static/js/admin.js