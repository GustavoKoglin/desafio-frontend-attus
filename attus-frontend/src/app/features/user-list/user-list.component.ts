import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { UserModalComponent } from '../user-modal/user-modal.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  searchControl = new FormControl('');
  
  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadInitialUsers();
    this.setupSearch();
  }

  loadInitialUsers() {
    this.loading.set(true);
    this.error.set(null);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar usuários.');
        this.loading.set(false);
      }
    });
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(searchTerm => this.userService.getUsers().pipe(
        map(users => {
          if (!searchTerm) return users;
          return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }),
        catchError(err => {
          this.error.set('Erro na busca.');
          return of([]);
        })
      ))
    ).subscribe(filtered => {
      this.users.set(filtered);
      this.loading.set(false);
    });
  }

  openUserModal(user?: User) {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '600px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recarregar os dados na view se algo mudou
        this.searchControl.setValue(this.searchControl.value); // Triggers re-search and updates UI
      }
    });
  }
}
