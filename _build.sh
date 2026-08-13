#!/bin/bash

if [ -n "$1" ]; then
    echo "This script takes no arguments" >&2
    exit 1
fi

cd $(dirname ${BASH_SOURCE[0]})

npx tsc --noEmit \
    || exit 1
node ./_build.js \
    || exit 1
bundle exec jekyll serve --incremental \
    || exit 1
