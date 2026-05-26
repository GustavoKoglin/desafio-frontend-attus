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
    { id: '2', name: 'Maria Souza', email: 'maria@email.com', cpf: '987.654.321-11', phone: '(11) 3333-3333', phoneType: 'residencial' },
    { id: '3', name: 'Carlos Santos', email: 'carlos@email.com', cpf: '111.222.333-44', phone: '(21) 98888-8888', phoneType: 'celular' },
    { id: '4', name: 'Ana Oliveira', email: 'ana@email.com', cpf: '222.333.444-55', phone: '(31) 3222-2222', phoneType: 'trabalho' },
    { id: '5', name: 'Pedro Costa', email: 'pedro@email.com', cpf: '333.444.555-66', phone: '(41) 97777-7777', phoneType: 'celular' },
    { id: '6', name: 'Luciana Lima', email: 'luciana@email.com', cpf: '444.555.666-77', phone: '(51) 3344-5566', phoneType: 'residencial' },
    { id: '7', name: 'Rafael Pereira', email: 'rafael@email.com', cpf: '555.666.777-88', phone: '(61) 96666-6666', phoneType: 'celular' },
    { id: '8', name: 'Camila Fernandes', email: 'camila@email.com', cpf: '666.777.888-99', phone: '(71) 3355-7788', phoneType: 'trabalho' },
    { id: '9', name: 'Bruno Alves', email: 'bruno@email.com', cpf: '777.888.999-00', phone: '(81) 95555-5555', phoneType: 'celular' },
    { id: '10', name: 'Fernanda Rocha', email: 'fernanda@email.com', cpf: '888.999.000-11', phone: '(91) 3366-9900', phoneType: 'residencial' },
    { id: '11', name: 'Marcos Ribeiro', email: 'marcos@email.com', cpf: '999.000.111-22', phone: '(85) 94444-4444', phoneType: 'celular' },
    { id: '12', name: 'Juliana Mendes', email: 'juliana@email.com', cpf: '000.111.222-33', phone: '(98) 3377-1122', phoneType: 'trabalho' }
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
