module.exports = {
    setupFilesAfterEnv: ['./jest.setup.js'],
    "transformIgnorePatterns": [
        "node_modules"
    ],
    moduleNameMapper: {
        '^.+\\.(wasm)$': '<rootDir>/jest.setup.js'
    }
}