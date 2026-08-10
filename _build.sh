#!/bin/bash

if [ -n "$1" ]; then
    echo "This script takes no arguments" >&2
    exit 1
fi

node "$(dirname ${BASH_SOURCE[0]})/_build.js" \
    || exit 1
bundle exec jekyll serve --incremental \
    || exit 1
