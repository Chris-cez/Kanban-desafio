const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Forneça o caminho para o seu aplicativo Next.js para carregar next.config.js e .env no ambiente de teste
  dir: './',
})

// Adicione qualquer configuração personalizada do Jest a ser passada para o createJestConfig
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Mapeia os aliases de caminho (se você os tiver em tsconfig.json)
    '^@/components/(.*)$': '<rootDir>/src/app/components/$1',
  },
}

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração do Next.js
module.exports = createJestConfig(customJestConfig)