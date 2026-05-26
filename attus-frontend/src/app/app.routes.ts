import { Routes } from '@angular/router';
import { UserListComponent } from './features/user-list/user-list.component';
import { LoginComponent } from './features/login/login.component';
import { AdminLogsComponent } from './features/admin-logs/admin-logs.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'users', 
    component: UserListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/logs',
    component: AdminLogsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: '**', redirectTo: 'users' }
];
