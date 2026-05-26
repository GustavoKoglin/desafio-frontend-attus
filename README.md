# Projeto Desafio FrontEnd – Attus

## Links úteis
- **Frontend**: [github.com/GustavoKoglin/desafioattus-front](https://github.com/GustavoKoglin/desafioattus-front)
- **Backend**: [github.com/GustavoKoglin/desafioattus-back](https://github.com/GustavoKoglin/desafioattus-back)
- **Demo local**: [http://localhost:4200/](http://localhost:4200/)
- **Demo em produção**: [https://desafioattus-front.vercel.app](https://desafioattus-front.vercel.app)
- **API local**: [http://localhost:3000/health](http://localhost:3000/health) e [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **API em produção**: [https://desafioattus-back.vercel.app/health](https://desafioattus-back.vercel.app/health) e [https://desafioattus-back.vercel.app/api-docs](https://desafioattus-back.vercel.app/api-docs)

## Estrutura monorepo
Este repositório contém **ambos** os projetos:

* `attus-backend` – API RESTful em Node.js/Express.
* `attus-frontend` – aplicação SPA em Angular 17.

### Por que o backend e o frontend estão no mesmo repositório?
1. **Facilidade de entrega para o desafio** – O enunciado da Attus pede um “frontend + backend” pronto para ser executado. Manter tudo em um único repositório simplifica a entrega e a avaliação.
2. **Coesão do código** – O frontend consome diretamente a API que está aqui, portanto alterações na rota ou no contrato (payload) podem ser testadas e versionadas em conjunto.
3. **Configuração de ambiente única** – O `docker‑compose.yml` presente na raiz orquestra os dois serviços, permitindo levantar todo o stack com um único comando (`docker compose up`).
4. **Visibilidade para recrutadores** – Um único clone contém tudo que o avaliador precisa analisar (documentação, testes, scripts de build).

### Quando separar em repositórios diferentes?
* **Escalabilidade** – Em projetos maiores, equipes distintas trabalham em backend e frontend; separar permite ciclos de release independentes.
* **Tecnologia divergente** – Caso o backend use outra linguagem ou framework que exija um pipeline CI/CD diferente.
* **Políticas de governança** – Repositórios com diferentes níveis de permissões ou licensing.

Se o projeto evoluir, basta mover `attus-backend` ou `attus-frontend` para repositórios próprios e ajustar o `docker‑compose.yml` ou criar pipelines de CI/CD separados.

---
*Este README foi gerado automaticamente por Antigravity.*
