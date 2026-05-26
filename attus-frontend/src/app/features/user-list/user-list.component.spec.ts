import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { TranslateModule } from '@ngx-translate/core';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: any;
  let mockDialog: any;

  beforeEach(async () => {
    mockUserService = {
      users: signal([]),
      logs: signal([]),
      getUsers: jest.fn().mockReturnValue(of([])),
      deleteUser: jest.fn().mockReturnValue(of({}))
    };

    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(true) })
    };

    await TestBed.configureTestingModule({
      imports: [UserListComponent, BrowserAnimationsModule, TranslateModule.forRoot()], // Removed MatDialogModule to use custom mock
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockDialog },
        provideEnvironmentNgxMask()
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial users on init', () => {
    expect(mockUserService.getUsers).toHaveBeenCalled();
  });

  it('should open modal on click', () => {
    component.openUserModal();
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
