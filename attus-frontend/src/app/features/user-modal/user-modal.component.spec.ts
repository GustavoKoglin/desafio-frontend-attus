import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserModalComponent } from './user-modal.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../core/services/user.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { provideEnvironmentNgxMask } from 'ngx-mask';

describe('UserModalComponent', () => {
  let component: UserModalComponent;
  let fixture: ComponentFixture<UserModalComponent>;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      addUser: jest.fn().mockReturnValue(of({})),
      updateUser: jest.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [UserModalComponent, BrowserAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: UserService, useValue: mockUserService },
        provideEnvironmentNgxMask()
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.userForm.valid).toBeFalsy();
  });

  it('should validate CPF', () => {
    const cpfControl = component.userForm.controls['cpf'];
    cpfControl.setValue('123'); // Invalid
    expect(cpfControl.valid).toBeFalsy();

    cpfControl.setValue('123.456.789-00'); // Valid
    expect(cpfControl.valid).toBeTruthy();
  });
});
