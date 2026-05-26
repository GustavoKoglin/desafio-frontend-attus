# Avaliação Técnica - Front End Angular - Respostas

## 1. TypeScript e Qualidade de Código

### 1.1. Refatoração
**Melhorias aplicadas:**
- Utilização de modificadores de acesso (`public`, `private`) e sintaxe enxuta no `constructor` da classe `Produto`.
- Tipagem rigorosa removendo o `any` nos construtores e métodos.
- Simplificação das lógicas de iteração utilizando métodos funcionais como `.find()`.
- Prevenção de exceções `null` e melhora na legibilidade utilizando template literals e `!!`.

```typescript
class Produto {
// O TypeScript permite declarar e atribuir as propriedades diretamente no construtor// O TypeScript permite declarar e atribuir as propriedades diretamente no construtor
  constructor(
    public id: number,
    public descricao: string,
    public quantidadeEstoque: number
  ) {}
}

class Verdureira {
  produtos: Produto[];

  constructor() {
    this.produtos = [
      new Produto(1, 'Maçã', 20),
      new Produto(2, 'Laranja', 0),
      new Produto(3, 'Limão', 20)
    ];
  }

  // Método auxiliar privado
  private getProdutoById(produtoId: number): Produto | undefined {
    return this.produtos.find(produto => produto.id === produtoId);
  }

  getDescricaoProduto(produtoId: number): string | undefined {
    // Usando o método auxiliar aqui!
    const produto = this.getProdutoById(produtoId); 
    
    if (!produto) return undefined;
    return `${produto.id} - ${produto.descricao} (${produto.quantidadeEstoque}x)`;
  }

  hasEstoqueProduto(produtoId: number): boolean {
    // Usando o método auxiliar aqui também!
    const produto = this.getProdutoById(produtoId); 
    
    return !!produto && produto.quantidadeEstoque > 0;
  }
}
```

### 1.2. Generics e tipos utilitários
```typescript
interface PaginaParams {
  pagina: number;
  tamanho: number;
}

interface Pagina<T> {
  itens: T[];
  total: number;
}

function filtrarEPaginar<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  params: PaginaParams
): Pagina<T> {
  // Aplicamos o filtro globalmente na lista
  const dadosFiltrados = data.filter(filterFn);
  const total = dadosFiltrados.length;
  
  // Realizamos o corte (slice) correspondente à página atual
  const start = (params.pagina - 1) * params.tamanho;
  const end = start + params.tamanho;
  const itens = dadosFiltrados.slice(start, end);

  return { itens, total };
}

// Exemplo concreto de uso:
interface Usuario {
  id: number;
  nome: string;
}

const usuarios: Usuario[] = [
  { id: 1, nome: 'João' },
  { id: 2, nome: 'Maria' },
  { id: 3, nome: 'José' },
  { id: 4, nome: 'Mário' },
];

const resultado = filtrarEPaginar<Usuario>(
  usuarios,
  (user) => user.nome.startsWith('M'),
  { pagina: 1, tamanho: 2 }
);
// { itens: [{ id: 2, nome: 'Maria' }, { id: 4, nome: 'Mário' }], total: 2 }
```

## 2. Angular - Fundamentos e Reatividade

### 2.1. Change Detection e OnPush
**Problema e Motivo:** O problema ocorre porque o componente está com `ChangeDetectionStrategy.OnPush`. Nesta estratégia, o Angular só refaz a verificação do template se a referência dos `@Input()`s mudar, se algum evento for emitido da view (ex: `(click)`), ou se for manualmente sinalizado (ou emitido por `AsyncPipe`). Como a propriedade `texto` é atualizada em um fluxo assíncrono (um `subscribe` após 500ms de `delay`) sem disparar nenhum desses gatilhos, o Angular não percebe que o valor mudou e não atualiza o HTML.

**Correção:** Usar `ChangeDetectorRef` para indicar ao Angular que a mudança ocorreu.
```typescript
import { ChangeDetectionStrategy, Component, Injectable, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

@Component({
  // ...
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class AppComponent implements OnInit, OnDestroy {
  texto: string;
  contador = 0;
  subscriptionBuscarPessoa: Subscription;

  constructor(
    private readonly pessoaService: PessoaService,
    private readonly cdr: ChangeDetectorRef // Injetando o ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptionBuscarPessoa = this.pessoaService.buscarPorId(1).subscribe((pessoa) => {
      this.texto = `Nome: ${pessoa.nome}`;
      this.cdr.markForCheck(); // Correção: Sinaliza para o Angular atualizar este componente na próxima iteração
    });

    setInterval(() => {
      this.contador++;
      this.cdr.markForCheck(); // Correção: Se quisermos que o contador seja exibido
    }, 1000);
  }
}
```

### 2.2. RxJS - eliminando subscriptions aninhadas
**Refatoração:** Usaremos o operador `switchMap`. Ele serve para mapear um valor para um novo Observable e se inscrever nele. Se o valor raiz mudar antes do segundo Observable terminar, o `switchMap` cancelará a subscrição anterior, evitando `race conditions` em buscas por IDs seguidos.
```typescript
import { switchMap, map } from 'rxjs/operators';

ngOnInit(): void {
  const pessoaId = 1;
  this.pessoaService.buscarPorId(pessoaId).pipe(
    switchMap(pessoa => 
      this.pessoaService.buscarQuantidadeFamiliares(pessoaId).pipe(
        map(qtd => `Nome: ${pessoa.nome} | familiares: ${qtd}`)
      )
    )
  ).subscribe(textoFinal => {
    this.texto = textoFinal;
  });
}
```

### 2.3. RxJS - busca com debounce
```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-busca',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <input type="text" [formControl]="searchControl" placeholder="Buscar..." />
    <span *ngIf="loading">Carregando...</span>
    
    <div *ngIf="resultados$ | async as resultados">
      <div *ngFor="let res of resultados">{{ res }}</div>
    </div>
  `
})
export class BuscaComponent {
  searchControl = new FormControl('');
  loading = false;
  
  resultados$: Observable<string[]> = this.searchControl.valueChanges.pipe(
    debounceTime(500),
    tap(() => this.loading = true),
    switchMap(termo => this.apiService.buscar(termo ?? '')), // switchMap previne race conditions
    tap(() => this.loading = false)
  );

  constructor(private apiService: ApiService) {}
}
```

### 2.4. Performance - OnPush e trackBy
- **Por que usar `trackBy` / `track`:** Sem o `trackBy`, o Angular, ao receber um novo array de dados por referência, destrói e recria todos os itens da lista do DOM, o que pode engasgar e quebrar performance. Com o `trackBy`, o framework só destrói/adiciona quem realmente não estava mais na lista com base na chave estipulada (ex: ID). (Nota: A partir do Angular 17, a sintaxe nativa (`@for`) é `@for(item of items; track item.id)` e tem ganho considerável de performance).
- **Como `OnPush` reduz ciclos:** Usando `OnPush`, o componente da lista (e os filhos) não passarão por `change detection` se os inputs (suas instâncias no array/objetos passados via Input) não sofrerem mutação da referência (ou se não houver clique ali). O Angular passa a ignorar esse bloco do Virtual DOM na verificação suja da árvore quando algum evento alheio ocorre no resto da página.
- **Impacto da estratégia Default:** Se uma lista gigante usar estratégia default, sempre que qualquer evento da tela acontecer (inclusive um input ou debounce numa aba ou componente distante), todo o loop ngFor/for e suas interpolações serão reprocessados para saber se os valores mudaram ou não.

## 3. Gerenciamento de Estado

### 3.1. Angular Signals - estado local
```typescript
import { Component, computed, signal, Output, EventEmitter, effect } from '@angular/core';

interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

@Component({
  selector: 'app-carrinho',
  standalone: true,
  template: `<!-- Template -->`
})
export class CarrinhoComponent {
  @Output() totalAlterado = new EventEmitter<number>();

  listaItens = signal<ItemCarrinho[]>([]);
  
  total = computed(() => {
    return this.listaItens().reduce((acc, item) => acc + (item.quantidade * item.preco), 0);
  });

  constructor() {
    effect(() => {
      // Efeito que emite sempre que o total for recalculado/mudar
      this.totalAlterado.emit(this.total());
    });
  }

  adicionarItem(item: ItemCarrinho) {
    this.listaItens.update(itens => [...itens, item]);
  }

  removerItem(id: number) {
    this.listaItens.update(itens => itens.filter(i => i.id !== id));
  }
}
```

### 3.2. Gerenciamento de Estado com NgRx (Feature To-do)
```typescript
// --- models/todo.ts ---
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// --- store/todo.actions.ts ---
import { createAction, props } from '@ngrx/store';

export const loadTodos = createAction('[Todo] Load Todos');
export const loadTodosSuccess = createAction('[Todo] Load Todos Success', props<{ todos: Todo[] }>());
export const loadTodosError = createAction('[Todo] Load Todos Error', props<{ error: any }>());
export const toggleTodoComplete = createAction('[Todo] Toggle Todo Complete', props<{ id: number }>());

// --- store/todo.reducer.ts ---
import { createReducer, on } from '@ngrx/store';

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: any;
}

const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null
};

export const todoReducer = createReducer(
  initialState,
  on(loadTodos, state => ({ ...state, loading: true })),
  on(loadTodosSuccess, (state, { todos }) => ({ ...state, loading: false, todos })),
  on(loadTodosError, (state, { error }) => ({ ...state, loading: false, error })),
  on(toggleTodoComplete, (state, { id }) => ({
    ...state,
    todos: state.todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  }))
);

// --- store/todo.selectors.ts ---
import { createSelector, createFeatureSelector } from '@ngrx/store';

export const selectTodoState = createFeatureSelector<TodoState>('todos');

export const selectAllTodos = createSelector(
  selectTodoState,
  (state) => state.todos
);

export const selectPendingTodos = createSelector(
  selectAllTodos,
  (todos) => todos.filter(todo => !todo.completed)
);

// --- store/todo.effects.ts ---
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class TodoEffects {
  loadTodos$ = createEffect(() => this.actions$.pipe(
    ofType(loadTodos),
    switchMap(() => this.http.get<Todo[]>('https://fake-api.com/todos').pipe(
      map(todos => loadTodosSuccess({ todos })),
      catchError(error => of(loadTodosError({ error })))
    ))
  ));

  constructor(private actions$: Actions, private http: HttpClient) {}
}
```
