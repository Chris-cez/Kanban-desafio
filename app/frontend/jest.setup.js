
// Adiciona matchers personalizados do jest-dom, como .toBeInTheDocument()
import '@testing-library/jest-dom'

// Mock global para a API fetch, para que nossos testes não façam chamadas de rede reais.
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]), // Resposta padrão: sucesso com array vazio
  })
);

// Mock para process.env, já que não é preenchido no ambiente de teste por padrão
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';