import { Component, OnInit, inject, signal, Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { Router } from '@angular/router';

import { MatDividerModule } from '@angular/material/divider';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  private translate = inject(TranslateService);

  constructor() {
    super();
    this.translate.onLangChange.subscribe(() => this.getTranslations());
    this.getTranslations();
  }

  getTranslations() {
    this.itemsPerPageLabel = this.translate.instant('PAGINATOR.ITEMS_PER_PAGE');
    this.nextPageLabel = this.translate.instant('PAGINATOR.NEXT_PAGE');
    this.previousPageLabel = this.translate.instant('PAGINATOR.PREV_PAGE');
    this.changes.next();
  }

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 ${this.translate.instant('PAGINATOR.OF')} ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} – ${endIndex} ${this.translate.instant('PAGINATOR.OF')} ${length}`;
  };
}

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
    MatPaginatorModule,
    MatSnackBarModule,
    TranslateModule,
    MatSelectModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  public translate = inject(TranslateService);

  get canEdit() {
    return this.authService.hasRole(['Admin', 'Editor']);
  }

  get isAdmin() {
    return this.authService.hasRole(['Admin']);
  }

  logout() {
    this.authService.logout();
  }

  goToLogs() {
    this.router.navigate(['/admin/logs']);
  }

  isDarkMode = false;
  currentLang = 'pt-br';
  languages = [
    { code: 'pt-br', name: 'Português', countryCode: 'br' },
    { code: 'en', name: 'English', countryCode: 'us' },
    { code: 'es', name: 'Español', countryCode: 'es' },
    { code: 'fr', name: 'Français', countryCode: 'fr' }
  ];

  get currentLangData() {
    return this.languages.find(l => l.code === this.currentLang) || this.languages[0];
  }

  searchControl = new FormControl('');
  
  users = signal<User[]>([]);
  paginatedUsers = signal<User[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  totalItems = signal<number>(0);
  pageSize = signal<number>(10000);
  currentPage = signal<number>(0);

  ngOnInit() {
    this.initTheme();
    this.initLang();
    this.loadInitialUsers();
    this.setupSearch();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  initLang() {
    const savedLang = localStorage.getItem('lang') || 'pt-br';
    this.currentLang = savedLang;
    this.translate.use(savedLang);
  }

  changeLang(lang: string) {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
  }

  handlePageEvent(e: PageEvent) {
    this.pageSize.set(e.pageSize);
    this.currentPage.set(e.pageIndex);
    this.updatePagination();
  }

  changePageSize(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(0);
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
          const lowerTerm = searchTerm.toLowerCase();
          return users.filter(u => u.name.toLowerCase().includes(lowerTerm) || u.email.toLowerCase().includes(lowerTerm));
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
        this.snackBar.open(this.translate.instant(user ? 'SNACKBAR.EDIT_SUCCESS' : 'SNACKBAR.ADD_SUCCESS'), this.translate.instant('SNACKBAR.CLOSE'), { duration: 3000 });
        this.searchControl.setValue(this.searchControl.value); // Triggers re-search and updates UI
      }
    });
  }

  deleteUser(user: User) {
    // Ideally we would translate the confirm dialog, but for simplicity we keep it or translate partially
    if (confirm(`Excluir ${user.name}?`)) {
      this.loading.set(true);
      this.userService.deleteUser(user.id!).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('SNACKBAR.DELETE_SUCCESS'), this.translate.instant('SNACKBAR.CLOSE'), { duration: 3000 });
          this.searchControl.setValue(this.searchControl.value);
        },
        error: () => {
          this.error.set('Erro ao excluir usuário.');
          this.loading.set(false);
        }
      });
    }
  }
}
