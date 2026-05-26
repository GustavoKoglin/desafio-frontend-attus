import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';
  private http = inject(HttpClient);

  // Estado local com Signals (opcional, ou podemos buscar toda vez)
  private _users = signal<User[]>([]);
  public users = this._users.asReadonly();
  
  // Os logs agora vêm da API
  public logs = signal<any[]>([]);

  constructor() { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(users => this._users.set(users))
    );
  }

  addUser(user: any): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(newUser => {
        this._users.update(users => [...users, newUser]);
      })
    );
  }

  updateUser(updatedUser: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${updatedUser.id}`, updatedUser).pipe(
      tap(user => {
        this._users.update(users => users.map(u => u.id === user.id ? user : u));
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._users.update(users => users.filter(u => u.id !== id));
      })
    );
  }
}
