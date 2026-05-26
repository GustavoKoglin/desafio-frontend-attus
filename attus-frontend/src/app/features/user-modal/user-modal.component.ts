import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxMaskDirective } from 'ngx-mask';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const cpf = control.value;
  if (!cpf) return null;
  const valid = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf) || /^\d{11}$/.test(cpf);
  return valid ? null : { invalidCpf: true };
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgxMaskDirective,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  loading = false;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<UserModalComponent>);
  private snackBar = inject(MatSnackBar);
  public translate = inject(TranslateService);
  public authService = inject(AuthService);
  public data = inject<{ user?: User }>(MAT_DIALOG_DATA);

  get isAdmin() {
    return this.authService.hasRole(['Admin']);
  }

  ngOnInit() {
    this.isEditMode = !!this.data.user;
    
    this.userForm = this.fb.group({
      id: [this.data.user?.id || ''],
      name: [this.data.user?.name || '', Validators.required],
      email: [this.data.user?.email || '', [Validators.required, Validators.email]],
      cpf: [this.data.user?.cpf || '', [Validators.required, cpfValidator]],
      phone: [this.data.user?.phone || '', Validators.required],
      phoneType: [this.data.user?.phoneType || '', Validators.required],
      role: [{ value: (this.data.user as any)?.role || 'Visualizador', disabled: !this.isAdmin }, Validators.required],
      password: ['']
    });
  }

  save() {
    if (this.userForm.invalid) return;
    
    this.loading = true;
    const userData = this.userForm.getRawValue();

    if (this.isEditMode) {
      this.userService.updateUser({ ...this.data.user, ...userData }).subscribe(() => {
        this.loading = false;
        this.dialogRef.close(true);
      });
    } else {
      this.userService.addUser(userData).subscribe(() => {
        this.loading = false;
        this.dialogRef.close(true);
      });
    }
  }

  deleteUser() {
    if (this.data.user && confirm(`Tem certeza que deseja excluir o usuário ${this.data.user.name}?`)) {
      this.loading = true;
      this.userService.deleteUser(this.data.user.id!).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('SNACKBAR.DELETE_SUCCESS'), this.translate.instant('SNACKBAR.CLOSE'), { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }
}
