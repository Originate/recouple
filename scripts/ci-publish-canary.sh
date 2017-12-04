#!/bin/sh
set -e

./node_modules/.bin/lerna publish --skip-git --canary --yes
