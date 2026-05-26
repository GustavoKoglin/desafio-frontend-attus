import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api';
  private http = inject(HttpClient);

  private _users = signal<User[]>([]);
  public users = this._users.asReadonly();
  
  public logs = signal<any[]>([]);

  constructor() { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      tap(users => this._users.set(users))
    );
  }

  addUser(user: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user).pipe(
      tap(newUser => {
        this._users.update(users => [...users, newUser]);
      })
    );
  }

  updateUser(updatedUser: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${updatedUser.id}`, updatedUser).pipe(
      tap(user => {
        this._users.update(users => users.map(u => u.id === user.id ? user : u));
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      tap(() => {
        this._users.update(users => users.filter(u => u.id !== id));
      })
    );
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateMe(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, data);
  }

  getPlatformUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/platform-users`);
  }

  createPlatformUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/platform-users`, user);
  }

  updatePlatformUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/platform-users/${id}`, user);
  }

  deletePlatformUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/platform-users/${id}`);
  }
}
