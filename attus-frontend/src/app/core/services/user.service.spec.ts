import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get initial users with delay', fakeAsync(() => {
    let result: any;
    service.getUsers().subscribe(users => result = users);
    
    expect(result).toBeUndefined(); // Before delay
    
    tick(800); // Simulate delay
    
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  }));

  it('should add a user and update signal', fakeAsync(() => {
    const newUser = { id: '', name: 'Test', email: 'test@t.com', cpf: '000', phone: '123', phoneType: 'celular' as const };
    
    service.addUser(newUser).subscribe();
    tick(500);
    
    const users = service.users();
    expect(users.find(u => u.name === 'Test')).toBeDefined();
  }));
});
