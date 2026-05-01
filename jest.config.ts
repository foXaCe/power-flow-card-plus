/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
  // All imported modules in your tests should be mocked automatically
  // automock: false,

  // Stop running tests after `n` failures
  // bail: 0,

  // The directory where Jest should store its cached dependency information
  // cacheDirectory: "/private/var/folders/_q/7p9yj5qd2d39p_yfjc5kmb8c0000gn/T/jest_dx",

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/index.ts"],

  coverageDirectory: "coverage",

  coverageProvider: "v8",

  coverageReporters: ["text", "lcov", "text-summary"],

  coverageThreshold: {
    global: {
      // Thresholds set 1 point below the current measured coverage (see
      // `pnpm test:coverage`). They give a small safety margin against minor
      // drift while still preventing silent regressions.
      branches: 49,
      functions: 49,
      lines: 37,
      statements: 37,
    },
  },

  // A path to a custom dependency extractor
  // dependencyExtractor: undefined,

  // Make calling deprecated APIs throw helpful error messages
  // errorOnDeprecated: false,

  // The default configuration for fake timers
  // fakeTimers: {
  //   "enableGlobally": false
  // },

  // Force coverage collection from ignored files using an array of glob patterns
  // forceCoverageMatch: [],

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: undefined,

  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: undefined,

  // A set of global variables that need to be available in all test environments
  // globals: {},

  // The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
  // maxWorkers: "50%",

  // An array of directory names to be searched recursively up from the requiring module's location
  // moduleDirectories: [
  //   "node_modules"
  // ],

  // An array of file extensions your modules use
  // moduleFileExtensions: [
  //   "js",
  //   "mjs",
  //   "cjs",
  //   "jsx",
  //   "ts",
  //   "tsx",
  //   "json",
  //   "node"
  // ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Strip explicit `.js` extension on relative imports — used in TS source
    // for NodeNext-style ESM (e.g. `import "./template/ha-websocket.js"`)
    // even though the on-disk file is `.ts`.
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
  // modulePathIgnorePatterns: [],

  // Activates notifications for test results
  // notify: false,

  // An enum that specifies notification mode. Requires { notify: true }
  // notifyMode: "failure-change",

  // A preset that is used as a base for Jest's configuration
  // preset: undefined,

  // Run tests from one or more projects
  // projects: undefined,

  // Use this configuration option to add custom reporters to Jest
  // reporters: undefined,

  // Automatically reset mock state before every test
  // resetMocks: false,

  // Reset the module registry before running each individual test
  // resetModules: false,

  // A path to a custom resolver
  // resolver: undefined,

  // Automatically restore mock state and implementation before every test
  // restoreMocks: false,

  // The root directory that Jest should scan for tests and modules within
  // rootDir: undefined,

  // A list of paths to directories that Jest should use to search for files in
  // roots: [
  //   "<rootDir>"
  // ],

  // Allows you to use a custom runner instead of Jest's default test runner
  // runner: "jest-runner",

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: [],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],

  // The number of seconds after which a test is considered as slow and reported as such in the results.
  // slowTestThreshold: 5,

  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  // snapshotSerializers: [],

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // Options that will be passed to the testEnvironment
  // testEnvironmentOptions: {},

  // Adds a location field to test results
  // testLocationInResults: false,

  // Restrict test discovery to actual `*.test.ts` files. Without this Jest's default
  // `**/__tests__/**/*.ts` glob would treat helpers (setup, fixtures) as test suites
  // and fail with "Your test suite must contain at least one test."
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  // testPathIgnorePatterns: [
  //   "/node_modules/"
  // ],

  // The regexp pattern or array of patterns that Jest uses to detect test files
  // testRegex: [],

  // This option allows the use of a custom results processor
  // testResultsProcessor: undefined,

  // This option allows use of a custom test runner
  // testRunner: "jest-circus/runner",

  transform: {
    "^.+\\.ts$": "ts-jest",
    // `lit` and friends ship as native ESM. Run them through babel-jest so jsdom
    // tests that import the Lit-based card don't choke on `import` statements.
    "^.+\\.m?js$": "babel-jest",
  },

  // Whitelist Lit (and related) packages so the `^.+\.m?js$` transform above
  // actually runs on them. The default `transformIgnorePatterns` excludes
  // everything under `node_modules`. The negative lookahead matches both the
  // top-level `node_modules/<pkg>` layout and pnpm's `.pnpm/<pkg>@.../node_modules/<pkg>`
  // layout (where scoped names use `+` instead of `/` in the directory name).
  transformIgnorePatterns: ["/node_modules/(?!(?:\\.pnpm/)?(?:@?lit|@lit-labs|lit-html|lit-element)[+@/])"],

  // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
  // unmockedModulePathPatterns: undefined,

  // Indicates whether each individual test should be reported during the run
  // verbose: undefined,

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  // watchPathIgnorePatterns: [],

  // Whether to use watchman for file crawling
  // watchman: true,
};

export default config;
