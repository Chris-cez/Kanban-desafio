# ⚙️ Guia de Configuração e Variáveis de Ambiente

Este documento detalha todas as variáveis de ambiente necessárias para configurar e executar o projeto Kanban localmente.

## Backend (`app/backend/.env`)

Na pasta `app/backend`, crie um arquivo chamado `.env` e preencha-o com as seguintes variáveis. Você pode copiar o arquivo `.env.example` como base.

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=kanban_db
JWT_SECRET=your_super_secret_key
PORT=3000
```

| Variável          | Descrição                                                                 | Exemplo                  |
| ----------------- | ------------------------------------------------------------------------- | ------------------------ |
| `DATABASE_HOST`   | O endereço do servidor do banco de dados PostgreSQL.                      | `localhost`              |
| `DATABASE_PORT`   | A porta na qual o banco de dados está escutando.                          | `5432`                   |
| `DATABASE_USER`   | O nome de usuário para se conectar ao banco de dados.                     | `postgres`               |
| `DATABASE_PASSWORD` | A senha para o usuário do banco de dados.                                 | `your_db_password`       |
| `DATABASE_NAME`   | O nome do banco de dados a ser utilizado pela aplicação.                  | `kanban_db`              |
| `JWT_SECRET`      | Uma chave secreta longa e aleatória para assinar os tokens de autenticação. | `your_super_secret_key`  |
| `PORT`            | A porta em que o servidor backend irá rodar.                              | `3000`                   |

---

## Frontend (`app/frontend/.env.local`)

Na pasta `app/frontend`, crie um arquivo chamado `.env.local`. Este arquivo é usado pelo Next.js para carregar variáveis de ambiente durante o desenvolvimento.

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

| Variável              | Descrição                                                              | Exemplo                   |
| --------------------- | ---------------------------------------------------------------------- | ------------------------- |
| `NEXT_PUBLIC_API_URL` | A URL base da API backend que o frontend irá consumir.                   | `http://localhost:3000`   |

> **Nota:** O prefixo `NEXT_PUBLIC_` é necessário para que a variável seja exposta ao navegador pelo Next.js.