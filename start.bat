@echo off
deno run --import-map=./import-map.json --allow-env --allow-net --allow-read --unstable --allow-write mod.ts