// Este arquivo é carregado automaticamente antes de cada teste.
// Ele estende o `expect` do Jest com os matchers do @testing-library/jest-dom,
// como .toBeInTheDocument(), .toHaveTextContent(), etc.

import '@testing-library/jest-dom';

// Mock global para a API fetch, para que nossos testes não façam chamadas de rede reais.
// Isso é útil para evitar que os testes de componentes tentem fazer chamadas de rede reais.
// Para testes que precisam de respostas específicas, use jest.spyOn(global, 'fetch') no próprio arquivo de teste.
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}), // Um objeto vazio é um mock mais seguro que um array
  })
) as jest.Mock;

// Mock para process.env, já que não é preenchido no ambiente de teste por padrão
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'; // A API do backend roda na porta 3000