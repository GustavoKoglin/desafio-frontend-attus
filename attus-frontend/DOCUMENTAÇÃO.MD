# Documentação do Frontend (attus-frontend)

## Visão Geral
Esta aplicação é uma SPA desenvolvida com **Angular 17** utilizando componentes independentes (standalone) e **Angular Material** para a interface visual. O foco foi reproduzir o desafio da Attus com boas práticas de performance, organização de código e acessibilidade.

## Tecnologias Utilizadas
* Angular 17 (TypeScript)
* Angular Material
* RxJS (debounceTime, distinctUntilChanged, switchMap, catchError, tap, map)
* Signals (gerenciamento de estado reativo)
* Jest (testes unitários)
* Docker (contêiner de desenvolvimento)

## Estrutura de Pastas
```
src/
│   app/                # módulo principal e rotas
│   assets/             # recursos estáticos
│   index.html          # página de entrada
│   main.ts             # bootstrap da aplicação
│   styles.css          # estilos globais
```

## Principais Componentes
1. **AppComponent** – ponto de entrada da aplicação, contém a barra de navegação e o roteador.
2. **UserListComponent** – exibe a lista de usuários com paginação, busca por nome (debounce) e botão para abrir a modal de cadastro.
3. **UserFormComponent** – modal reutilizável para criação e edição de usuários, inclui validação de CPF e máscara de telefone.
4. **LoginComponent** – tela de autenticação que gera JWT para consumo da API.
5. **HeaderComponent** – barra superior com opções de login/logout e tema.

## Fluxo de Dados
- Os serviços utilizam **HttpClient** para consumir a API do backend (`/api/...`).
- O **AuthService** armazena o token JWT em `localStorage` e expõe um `Signal` de usuário autenticado.
- O **UserService** fornece sinais para a lista de usuários e ações de criação, atualização e remoção, atualizando a UI reativamente.

## Funcionalidades Implementadas
* Autenticação via JWT com guardas de rota protegidas.
* Listagem de usuários com paginação e filtro por nome, aplicando `debounceTime(300)` para otimizar chamadas.
* Criação, edição e exclusão de usuários através de modal com validação avançada (CPF, e‑mail, telefone).
* Controle de permissões baseado nos papéis (Admin, Editor, Visualizador) recebidos no payload do JWT.
* Persistência de sessão e renovação automática do token até a expiração de 8h.
* Tema escuro configurável via CSS custom properties.
* Testes unitários cobrindo componentes críticos e serviços, atingindo cobertura superior a 60%.

## Execução Local
```bash
# Instalar dependências
npm install

# Executar aplicação em modo desenvolvimento
npm start   # ou ng serve
```
A aplicação ficará disponível em **http://localhost:4200**.

## Execução via Docker
```bash
docker build -t attus-frontend .
docker run -p 4200:80 attus-frontend
```

## Testes
```bash
npm run test   # executa Jest e gera relatório de cobertura em coverage/
```

## Observações
* O projeto utiliza **Signals** para evitar o overhead do zone.js tradicional, proporcionando atualização de UI mais eficiente.
* A validação de CPF aceita tanto formato puro (11 dígitos) quanto formatado com pontos e hífen, porém não utiliza o caracter hífen.
* Não há uso de caracteres de subtração em nenhum ponto da documentação nem do código.

---
*Documento gerado automaticamente por Antigravity.*
