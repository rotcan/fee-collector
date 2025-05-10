/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  setupFiles:['./dotenv-config.js'],
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};