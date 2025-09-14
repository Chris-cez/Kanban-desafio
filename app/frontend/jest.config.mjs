import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Forneça o caminho para o seu aplicativo Next.js para carregar os arquivos next.config.js e .env em seu ambiente de teste
  dir: './',
});

// Adicione qualquer configuração personalizada a ser passada para o Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Adiciona mais opções de configuração antes de cada teste ser executado
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Se estiver usando TypeScript com um baseUrl configurado para o diretório src, você precisará do seguinte para que o aliasing funcione
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    // Mapeia os aliases de caminho (se você os tiver em tsconfig.json)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração do Next.js, que é assíncrona
export default createJestConfig(customJestConfig);