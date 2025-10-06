# Kanban - Desafio Full Stack

Este é um projeto de um aplicativo Kanban completo, desenvolvido como um monorepo contendo um backend em NestJS, um frontend em Next.js e a infraestrutura como código com Terraform.

## 🚀 Tecnologias Utilizadas

- **Monorepo:** [NPM Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- **Backend:** [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), [PostgreSQL](https://www.postgresql.org/)
- **Frontend:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Testes:** [Jest](https://jestjs.io/) (Unitários), [Cypress](https://www.cypress.io/) (E2E)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)

## 📚 Documentação

A documentação do projeto está dividida para facilitar a consulta:

*   **🏛️ Documentação da Arquitetura (READARCH.md)**: Detalhes sobre a infraestrutura na AWS, componentes e fluxos de dados.
*   **⚙️ Guia de Configuração (READCONFIG.md)**: Instruções e lista de todas as variáveis de ambiente necessárias.
*   **🏗️ Infraestrutura como Código (infra/README.md)**: Explicação detalhada dos módulos Terraform.

## 🚀 Começando (Desenvolvimento Local)

1.  **Pré-requisitos:** Garanta que você tenha Node.js (v20+), NPM (v10+) e Docker instalados.

2.  **Clonar o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd Kanban-desafio
    ```

3.  **Instalar dependências:** Na raiz do projeto, execute:
    ```bash
    npm install
    ```

4.  **Configurar Variáveis de Ambiente:** Siga as instruções no **Guia de Configuração**.

5.  **Iniciar o Banco de Dados e Rodar a Aplicação:**
    ```bash
    # Inicia o container do banco de dados em background
    docker-compose up -d

    # Roda as migrations para criar as tabelas
    npm run typeorm:run-migrations -w backend

    # Inicia o backend e o frontend simultaneamente
    npm run dev
    ```

## 🧪 Rodando os Testes

Os testes são configurados para rodar de forma independente em cada workspace.

```bash
# Rodar todos os testes de unidade (frontend e backend)
npm test

# Rodar testes de unidade do backend
npm test -w backend

# Rodar testes de unidade do frontend
npm test -w frontend

# Rodar testes E2E (Full Stack) com Cypress
# Garanta que o backend e o frontend estejam rodando antes!
npm run cy:run -w frontend
```