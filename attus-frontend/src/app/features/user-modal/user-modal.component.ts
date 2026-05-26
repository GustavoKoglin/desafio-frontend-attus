import { Component, Inject, OnInit } from '@angular/core';
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
    NgxMaskDirective
  ],
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User },
    private userService: UserService
  ) {}

  ngOnInit() {
    this.isEditMode = !!this.data.user;
    
    this.userForm = this.fb.group({
      id: [this.data.user?.id || ''],
      name: [this.data.user?.name || '', Validators.required],
      email: [this.data.user?.email || '', [Validators.required, Validators.email]],
      cpf: [this.data.user?.cpf || '', [Validators.required, cpfValidator]],
      phone: [this.data.user?.phone || '', Validators.required],
      phoneType: [this.data.user?.phoneType || '', Validators.required]
    });
  }

  save() {
    if (this.userForm.invalid) return;
    
    this.saving = true;
    const userData = this.userForm.value;

    const request$ = this.isEditMode 
      ? this.userService.updateUser(userData)
      : this.userService.addUser(userData);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving = false;
        // Tratamento de erro poderia ser adicionado aqui (ex: Snackbar)
      }
    });
  }
}
