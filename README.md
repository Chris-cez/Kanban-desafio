# Kanban - Desafio Full Stack

Este é um projeto de um aplicativo Kanban completo, desenvolvido como um monorepo contendo um backend em NestJS e um frontend em Next.js.

## 🚀 Tecnologias Utilizadas

- **Monorepo:** [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- **Backend:** [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), [PostgreSQL](https://www.postgresql.org/)
- **Frontend:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Testes:** [Jest](https://jestjs.io/) (Unitários), [Cypress](https://www.cypress.io/) (E2E)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)

## 📂 Estrutura do Projeto

O projeto é organizado como um monorepo para facilitar o desenvolvimento e o gerenciamento de dependências:

```
/
├── app/
│   ├── backend/      # Aplicação NestJS (API)
│   └── frontend/     # Aplicação Next.js (UI)
├── package.json      # Configuração do workspace
└── README.md         # Este arquivo
```

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 20.x ou superior)
- [NPM](https://www.npmjs.com/) (versão 10.x ou superior)
- [Docker](https://www.docker.com/) (para rodar o banco de dados PostgreSQL)

## ⚙️ Instalação e Configuração

Siga os passos abaixo para configurar o ambiente de desenvolvimento.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/Kanban-desafio.git
    cd Kanban-desafio
    ```

2.  **Instale as dependências:**
    > **Importante:** Execute este comando **apenas na raiz do projeto**. O NPM Workspaces cuidará de instalar as dependências para o `frontend` e o `backend`.
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    No diretório `app/backend`, crie um arquivo `.env` a partir do exemplo:
    ```bash
    cp app/backend/.env.example app/backend/.env
    ```
    Ajuste as variáveis no arquivo `app/backend/.env` se necessário (as senhas padrão já devem funcionar com o Docker Compose).

4

4.  **Inicie o Banco de Dados:**
    Use o Docker Compose para iniciar o container do PostgreSQL.
    ```bash
    docker-compose up -d
    ```

5.  **Rode as Migrations:**
    Para criar as tabelas no banco de dados, execute o script de migration do TypeORM.
    ```bash
    npm run typeorm:run-migrations -w backend
    ```

## 🏃‍♀️ Rodando a Aplicação

Você pode rodar o frontend e o backend separadamente ou juntos.

### Rodando Separadamente

```bash
# Em um terminal, para rodar o backend (API na porta 3000)
npm run start:dev -w backend

# Em outro terminal, para rodar o frontend (UI na porta 3001)
npm run dev -w frontend
```

### Rodando Simultaneamente

Para rodar ambos com um único comando, instale o `concurrently`:

```bash
npm install concurrently -D
```

E adicione o seguinte script ao `package.json` da **raiz**:

```json
"scripts": {
  "dev": "concurrently \"npm:start:dev -w backend\" \"npm:dev -w frontend\""
}
```

Agora, você pode iniciar tudo com:

```bash
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