#!/bin/bash
# This file is to help with local builds

while [ -n "$1" ]; do
    case "$1" in
        js)
            shopt -s globstar
            npx esbuild **/*.tsx --outbase=. --outdir=.
            ;;
        *)
            echo "Unknown argument: $1"
            ;;
    esac
    shift
done

bundle exec jekyll serve --incremental
