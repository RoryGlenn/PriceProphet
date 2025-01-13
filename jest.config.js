module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^lightweight-charts$': '<rootDir>/src/__mocks__/lightweight-charts.ts'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/**/*.d.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
}; 