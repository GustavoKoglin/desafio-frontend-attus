# Desafio FrontEnd - Attus (Angular 17+)

Este projeto é a resolução prática do desafio FrontEnd da Attus. A aplicação consiste em um sistema de listagem e cadastro de usuários, construída seguira todas as diretrizes solicitadas, focando em performance, boas práticas e organização de código.

## 🚀 Tecnologias Utilizadas

- **Angular 17** (Standalone Components)
- **Angular Material** (Estilização de componentes, Modal)
- **RxJS** (Operadores aplicados: `debounceTime`, `distinctUntilChanged`, `switchMap`, `catchError`, `tap`, `map`)
- **Signals** (Gerenciamento de Estado Reativo)
- **Jest** (Testes Unitários)
- **Mock de API** (Simulando uma API real com Observables e `delay`)

## ⚙️ Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- **Node.js** (Versão mínima: 18.x)
- **NPM** (Versão mínima: 9.x)

## 📦 Instalação e Execução Local

Siga os passos abaixo para rodar o projeto na sua máquina:

1. Acesse o diretório do projeto:
```bash
cd "Desafio FrontEnd/attus-frontend"
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie a aplicação:
```bash
npm start
```
> O servidor iniciará e o projeto estará disponível em **http://localhost:4200/**.

## 🧪 Testes Unitários

O projeto utiliza **Jest** para execução de testes (conforme selecionado).
Para rodar os testes unitários e verificar a cobertura do código (cobertura exigida >60%), execute:

```bash
npm run test
```
> Um diretório `coverage/` será criado com o relatório detalhado dos testes.

## 🏗️ Estrutura e Decisões Técnicas

- **Estado com Signals:** Para o gerenciamento de estado local da aplicação, foi adotado a abordagem com `Signals`, nativa e recomendada a partir do Angular 16+, fornecendo extrema performance comparado ao Zone.js tradicional.
- **Debounce:** O filtro por nome na listagem utiliza o operador RxJS `debounceTime(300)` aliado ao `switchMap` para cancelar fluxos de pesquisa anteriores caso novas digitações ocorram rapidamente.
- **Validação de CPF:** Criou-se um form validator estrito na modal que avalia via regex CPFs puros (11 dígitos) e CPFs com máscara.
