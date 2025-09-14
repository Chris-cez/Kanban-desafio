import { defineConfig } from 'cypress';
import { Pool } from 'pg';

export default defineConfig({
  e2e: {
    // Define a URL base da sua aplicação para evitar repeti-la nos testes.
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Configuração da pool de conexão com o banco de dados de teste
      // As variáveis de ambiente devem ser configuradas no seu ambiente de teste
      const pool = new Pool({
        user: process.env.TEST_DB_USER || 'postgres',
        host: process.env.TEST_DB_HOST || 'localhost',
        database: process.env.TEST_DB_NAME || 'kanban_test',
        password: process.env.TEST_DB_PASSWORD || 'docker',
        port: parseInt(process.env.TEST_DB_PORT || '5432'),
      });

      on('task', {
        // Define uma tarefa 'db:reset' que pode ser chamada dos testes
        async 'db:reset'() {
          const client = await pool.connect();
          await client.query('TRUNCATE users, boards, tasks, "board-members" RESTART IDENTITY CASCADE');
          client.release();
          return null;
        },
      });
    },
  },
});