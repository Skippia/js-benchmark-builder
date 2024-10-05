# Benchmark playground

## Description

This repository is devoted benchamarking different JS (frameworks / runtimes) a.k.a "transports" in different usecases building web-server dynamically in runtime based on CLI.

These transports are:
  - Node.js (v20)
  - Bun (v1.1.26)
  - Express.js (v4.19.2)
  - Fastify (v4.28.1)
  - uWebSockets (v20.48.0)

These usecases are:
  - Empty request
  - Heavy non-blocking request (setTimeout)
  - Heavy blocking request (heavy CPU-bound)
  - Pg-pool create user request
  - Pg-pool get user request
  - Redis create user request
  - Redis get user request

## Features

- dynamic scaffolding web-server based on CLI (transport + usecase)
- dynamic scaffolding benchmark test based on CLI ()
## How it works?

### Class diagram

### Sequency diagram

## Usage

### Manual mode

In this mode you should separately run web server and benchmark usecase. For example:
1. Run web server:
```bash
npm run server -- -t node -u empty
```
Supported flags for manual benchmark running:
- u — usecase (*)
- t — transport (*)

2. Run benchmark:
```bash
npm run benchmark:manual -- -u empty -c 100 -p 1 -w 3 -d 60
```

Supported flags for manual benchmark running:
- u — usecase (*)
- c — connections
- p — pipelining factor
- w — workers
- d — duration

or
```bash
autocannon http://localhost:3001/empty -d 30 -c 100 -w 3
```

Such mode will produce benchmark result only in terminal for specific usecase.

### Automatic mode

In this mode you should run only one script which under the hood will test all usecases running them on each transport (you change config at `src/benchmark/automate-config.ts`):

Run automate script:
```bash
npm run benchmark:automate
```

Such mode will produce benchmark result in new file `/benchmarks-data/benchmark-${last-snapshot}.json` and create / upgrade `benchmark-summary.md` file which will contain comparison table based on last snapshot json file.

## Benchmark results

- To check "raw" data check `/benchmarks-data/benchmark-${last-snapshot}.json` (each new run of benchmark generates new json file with result)
- To check summary data of last benchmark (comparison table) check `benchmark-summary.md` file.
