#!/bin/bash
# This file is to help with local builds

while [ -n "$1" ]; do
    case "$1" in
        js)
            shopt -s globstar \
                && npx esbuild **/*.ts --bundle --outbase=. --outdir=/_js \
                && npx esbuild **/*.tsx --bundle --outbase=. --outdir=/_js \
            || exit 1
            ;;
        *)
            echo "Unknown argument: $1"
            exit 1
            ;;
    esac
    shift
done

bundle exec jekyll serve --incremental
