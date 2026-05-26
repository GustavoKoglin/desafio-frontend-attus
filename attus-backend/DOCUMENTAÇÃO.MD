# Documentação do Backend (attus-backend)

## Visão Geral
Este backend é uma API RESTful construída com **Node.js**, **Express** e **TypeScript**. Gerencia usuários da aplicação, logs de auditoria e oferece endpoints para administração de usuários da plataforma e do app.

## Tecnologias
* Node.js (v18)
* TypeScript
* Express
* JWT (autenticação)
* bcryptjs (hash de senhas)
* uuid (geração de IDs)
* cors (manipulação de CORS)
* Docker (containerização)

## Estrutura de Dados (`db.json`)
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "password": "hash",
      "role": "Admin | Editor | Visualizador",
      "type": "Platform | App",
      "cpf": "string",
      "phone": "string",
      "phoneType": "celular | telefone"
    }
  ],
  "logs": [
    {
      "id": "uuid",
      "action": "string",
      "authorName": "string",
      "authorEmail": "string",
      "local": "IP",
      "date": "dd/mm/aaaa",
      "time": "HH:MM:SS",
      "timezone": "TZ"
    }
  ]
}
```

## Endpoints da API
* **POST** `/api/login` – Autentica usuário e devolve JWT.
* **GET** `/api/me` – Retorna perfil completo do usuário logado (sem password). Requer JWT.
* **PUT** `/api/me` – Atualiza nome, cpf e telefone do usuário logado. Requer JWT.
* **GET** `/api/users` – Lista usuários **App** (exclui Platform e admins). Requer JWT.
* **POST** `/api/users` – Cria novo usuário **App**. Requer JWT. Permissões **Admin**, **Editor**.
* **PUT** `/api/users/:id` – Atualiza usuário **App**. Requer JWT. Permissões **Admin**, **Editor**.
* **DELETE** `/api/users/:id` – Remove usuário **App**. Requer JWT. Permissões **Admin**, **Editor**.
* **GET** `/api/logs` – Lista logs de auditoria. Requer JWT. Permissão **Admin**.
* **GET** `/api/platform-users` – Lista usuários da plataforma (type=Platform ou role=Admin). Requer JWT. Permissões **Admin**, **Editor**.
* **POST** `/api/platform-users` – Cria usuário da plataforma. Requer JWT. Permissão **Admin**.
* **PUT** `/api/platform-users/:id` – Atualiza usuário da plataforma. Requer JWT. Permissão **Admin**.
* **DELETE** `/api/platform-users/:id` – Remove usuário da plataforma (não pode excluir a si mesmo). Requer JWT. Permissão **Admin**.

### Autenticação
* O JWT é assinado com a chave `SUPERSECRETKEY-ATTUS-DESAFIO`.
* Payload inclui id, email, role e name.
* Expira em 8 horas.
* Enviar token no cabeçalho `Authorization: Bearer <token>`.

### Middleware de Controle de Acesso
* `authMiddleware` verifica presença e validade do JWT.
* `roleMiddleware([...roles])` garante que o usuário possua um dos papéis especificados.

### Logs de Auditoria
Função `addLog(action, authorName, authorEmail, ip)` grava cada operação sensível em `db.json.logs`.

## Execução Local
```bash
npm install
npm run dev   # ou ts-node server.ts
```

## Execução via Docker
```bash
docker build -t attus-backend .
docker run -p 3000:3000 attus-backend
```

## Testes
Ainda não há testes automatizados. Planeja‑se utilizar **Jest** ou **Mocha**.

## Observações
* A senha padrão do admin é gerada ao iniciar o banco (`Teste@teste123!`).
* O banco de dados é um arquivo JSON simples, adequado apenas para protótipo.
* Todos os endpoints retornam JSON e seguem boas práticas de códigos de status HTTP.

---
*Documento gerado automaticamente por Antigravity.*
