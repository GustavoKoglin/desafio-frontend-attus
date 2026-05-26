import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/services/user.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: any;
  let mockDialog: any;

  beforeEach(async () => {
    mockUserService = {
      getUsers: jest.fn().mockReturnValue(of([]))
    };

    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(true) })
    };

    await TestBed.configureTestingModule({
      imports: [UserListComponent, BrowserAnimationsModule, MatDialogModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockDialog }
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
