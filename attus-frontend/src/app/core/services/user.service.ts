import { Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Estado local com Signals
  private _users = signal<User[]>([
    { id: '1', name: 'João Silva', email: 'joao@email.com', cpf: '123.456.789-00', phone: '(11) 99999-9999', phoneType: 'celular' },
    { id: '2', name: 'Maria Souza', email: 'maria@email.com', cpf: '987.654.321-11', phone: '(11) 3333-3333', phoneType: 'residencial' }
  ]);
  
  private _logs = signal<{date: Date, message: string}[]>([]);

  public users = this._users.asReadonly();
  public logs = this._logs.asReadonly();
  
  constructor() { }

  private addLog(message: string) {
    this._logs.update(logs => [{ date: new Date(), message }, ...logs]);
  }

  getUsers(): Observable<User[]> {
    return of(this.users()).pipe(delay(800)); // Simulando delay de rede
  }

  addUser(user: User): Observable<User> {
    const newUser = { ...user, id: Math.random().toString(36).substring(2, 9) };
    this._users.update(users => [...users, newUser]);
    this.addLog(`Usuário ${newUser.name} criado com sucesso.`);
    return of(newUser).pipe(delay(500));
  }

  updateUser(updatedUser: User): Observable<User> {
    this._users.update(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
    this.addLog(`Usuário ${updatedUser.name} editado.`);
    return of(updatedUser).pipe(delay(500));
  }

  deleteUser(id: string): Observable<void> {
    const userToDel = this._users().find(u => u.id === id);
    this._users.update(users => users.filter(u => u.id !== id));
    if (userToDel) {
      this.addLog(`Usuário ${userToDel.name} excluído.`);
    }
    return of(void 0).pipe(delay(500));
  }
}
