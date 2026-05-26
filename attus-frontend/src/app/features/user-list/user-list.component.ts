import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
    MatDialogModule,
    MatPaginatorModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  
  users = signal<User[]>([]);
  paginatedUsers = signal<User[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  totalItems = signal<number>(0);
  pageSize = signal<number>(5);
  currentPage = signal<number>(0);

  ngOnInit() {
    this.loadInitialUsers();
    this.setupSearch();
  }

  handlePageEvent(e: PageEvent) {
    this.currentPage.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    this.paginatedUsers.set(this.users().slice(startIndex, endIndex));
  }

  loadInitialUsers() {
    this.loading.set(true);
    this.error.set(null);
    this.userService.getUsers().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.users.set(data);
        this.totalItems.set(data.length);
        this.updatePagination();
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
      takeUntilDestroyed(this.destroyRef),
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
      this.totalItems.set(filtered.length);
      this.currentPage.set(0);
      this.updatePagination();
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
