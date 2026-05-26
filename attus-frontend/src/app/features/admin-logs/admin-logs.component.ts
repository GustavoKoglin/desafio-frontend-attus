import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMaskDirective } from 'ngx-mask';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTabsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    NgxMaskDirective,
    TranslateModule
  ],
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.css']
})
export class AdminLogsComponent implements OnInit {
  logs: any[] = [];
  platformUsers: User[] = [];
  loading = true;
  loadingUsers = true;
  currentUser: any = null;
  profileForm!: FormGroup;

  private http = inject(HttpClient);
  private router = inject(Router);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  public translate = inject(TranslateService);

  get isAdmin() {
    return this.authService.hasRole(['Admin']);
  }

  ngOnInit() {
    this.translate.setDefaultLang('pt-br');
    this.translate.use(this.translate.currentLang || this.translate.getDefaultLang() || 'pt-br');

    this.currentUser = this.authService.currentUser();
    this.initProfileForm();
    
    // Busca dados completos para preencher o formulário
    this.userService.getMe().subscribe({
      next: (fullUser) => {
        this.currentUser = fullUser;
        this.profileForm.patchValue({
          name: fullUser.name,
          email: fullUser.email,
          cpf: fullUser.cpf,
          phone: fullUser.phone
        });
      }
    });
    
    if (this.isAdmin) {
      this.fetchLogs();
      this.fetchPlatformUsers();
    }
  }

  initProfileForm() {
    this.profileForm = this.fb.group({
      name: [this.currentUser?.name || '', Validators.required],
      email: [{ value: this.currentUser?.email || '', disabled: true }],
      cpf: [this.currentUser?.cpf || ''],
      phone: [this.currentUser?.phone || '']
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    
    const updatedData = { ...this.currentUser, ...this.profileForm.value };
    this.userService.updateMe(updatedData).subscribe({
      next: () => {
        this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', { duration: 3000 });
        // Optionally update auth token if you have a refresh mechanism, or just reflect local changes.
      },
      error: () => {
        this.snackBar.open('Erro ao atualizar perfil.', 'Fechar', { duration: 3000 });
      }
    });
  }

  fetchLogs() {
    this.http.get<any[]>('http://localhost:3000/api/logs').subscribe({
      next: (data) => {
        this.logs = data.reverse();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  fetchPlatformUsers() {
    this.userService.getPlatformUsers().subscribe({
      next: (users) => {
        this.platformUsers = users.filter(u => u.id !== this.currentUser?.id);
        this.loadingUsers = false;
      },
      error: () => this.loadingUsers = false
    });
  }

  openUserModal(user?: User) {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '600px',
      data: { user, type: 'Platform' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchPlatformUsers(); // Recarrega a lista se houver mudança
      }
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
