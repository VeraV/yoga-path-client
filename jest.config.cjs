const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    ...tsJestTransformCfg,
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
        diagnostics: false,
        astTransformers: {
          before: [
            {
              path: "ts-jest-mock-import-meta",
              options: {
                metaObjectReplacement: {
                  env: {
                    VITE_API_URL: "http://localhost:8080/api",
                  },
                },
              },
            },
          ],
        },
      },
    ],
  },
  setupFilesAfterEnv: ["./src/jest.setup.ts"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
