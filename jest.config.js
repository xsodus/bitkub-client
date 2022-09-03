module.exports = {
  rootDir: ".",
  collectCoverage: true,
  collectCoverageFrom: ["./src/**/*.ts"],
  coverageDirectory: "<rootDir>/reports/coverage",
  moduleDirectories: ["node_modules"],

  transform: {
    "^.+\\.ts?$": "babel-jest",
  },
  setupFiles: ["<rootDir>/jestSetupFile.ts"],
};
