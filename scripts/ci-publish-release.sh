#!/bin/sh
set -e

./node_modules/.bin/lerna publish --skip-git --yes
git ls-files | grep 'package.json$' | xargs git add
VERSION=$(cd recouple; yarn info --json | jq '.data.version' --raw-output)
git commit  -m "[ci skip] version bump: $VERSION"
git push origin HEAD
