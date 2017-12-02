#!/bin/sh
./node_modules/.bin/lerna publish --skip-git --canary --yes
git ls-files | grep '\package.json$' | xargs git add
git commit  -m "[ci skip] version bump: $(yarn info --json | jq '.data.version' --raw-output)"
git push origin HEAD
