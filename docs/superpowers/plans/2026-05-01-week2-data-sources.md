# Week 2 Data Sources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Week 2 backend data path so TideTai can return tide, weather, pressure, water temperature, and moon data from one CloudBase `data-today` function.

**Architecture:** Keep third-party API access inside `cloud-functions/shared/`. `data-today` validates input, reads/writes cache collections, fetches missing data through provider clients, computes moon data locally, and returns the shape defined in `docs/API_CONTRACTS.md`. Miniapp pages call only CloudBase functions through `miniapp/utils/api.js`.

**Tech Stack:** WeChat Mini Program native JS, Tencent CloudBase Node.js cloud functions, Node built-in test runner.

---

### Task 1: Provider Parsing Tests

**Files:**
- Create: `tests/cloud/data-sources.test.js`
- Create: `cloud-functions/shared/tide-fetcher.js`
- Create: `cloud-functions/shared/weather-fetcher.js`
- Create: `cloud-functions/shared/moon-calculator.js`

- [x] **Step 1: Write failing tests**

Test WorldTides `heights`/`extremes` parsing, QWeather realtime weather parsing, Open-Meteo marine sea-surface-temperature parsing, and local moon phase text calculation.

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/cloud/data-sources.test.js`

Expected: FAIL with missing module errors for the shared provider files.

- [ ] **Step 3: Implement minimal provider modules**

Implement pure parser functions first, then small fetch wrappers that accept injected fetch clients for testability.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/cloud/data-sources.test.js`

Expected: PASS.

### Task 2: Data Today Aggregation

**Files:**
- Create: `tests/cloud/data-today.test.js`
- Create: `cloud-functions/data-today/index.js`
- Create: `cloud-functions/data-today/package.json`
- Create: `cloud-functions/data-today/service.js`
- Create: `cloud-functions/shared/cache.js`
- Create: `cloud-functions/shared/errors.js`

- [ ] **Step 1: Write failing tests**

Test that `buildTodayData` combines tide, weather, marine, and moon into the API contract shape and prefers cache when data is fresh.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/cloud/data-today.test.js`

Expected: FAIL with missing module errors.

- [ ] **Step 3: Implement minimal aggregation and cache helpers**

Implement request validation, six-hour cache freshness checks, provider orchestration, and uniform error objects.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/cloud/data-today.test.js`

Expected: PASS.

### Task 3: Miniapp API and Home Screen

**Files:**
- Modify: `tests/miniapp/cloud-api.test.js`
- Modify: `miniapp/utils/api.js`
- Modify: `miniapp/pages/home/index.js`
- Modify: `miniapp/pages/home/index.wxml`
- Modify: `miniapp/pages/home/index.wxss`
- Modify: `miniapp/app.json`

- [ ] **Step 1: Write failing miniapp API test**

Add a test showing `api.getTodayData({ spotId })` calls the `data-today` cloud function with the expected payload.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/miniapp/cloud-api.test.js`

Expected: FAIL because `getTodayData` is not implemented.

- [ ] **Step 3: Implement miniapp API and simple Week 2 home rendering**

Add the CloudBase function call and a compact home screen that shows raw information without scores or recommendations.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/miniapp/cloud-api.test.js`

Expected: PASS.

### Task 4: Docs and Verification

**Files:**
- Create: `docs/WEEK2_DATA_SOURCES.md`
- Modify: `README.md`

- [ ] **Step 1: Document provider environment variables**

Document `WORLDTIDES_API_KEY`, `QWEATHER_API_HOST`, `QWEATHER_JWT`, and the Open-Meteo fallback.

- [ ] **Step 2: Run full verification**

Run: `node --test`, JSON parsing checks, and `git diff --check`.

- [ ] **Step 3: Commit and push**

Commit with `Build Week 2 data source pipeline` and push `main` to `origin`.
