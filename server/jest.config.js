const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig')

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathMapper: pathsToModuleNameMapper(compilerOptions.paths)
};