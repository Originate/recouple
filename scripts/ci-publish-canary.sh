#!/bin/sh
set-e

./node_modules/.bin/lerna publish --skip-git --canary --yes

# TODO: delete the following lines when deleting sl/master-test
git commit  --allow-empty -m "[ci skip] testing if ci can write to a protected branch"
git push origin HEAD
