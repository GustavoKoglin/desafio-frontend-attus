import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTabsModule,
    MatDialogModule,
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

  private http = inject(HttpClient);
  private router = inject(Router);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  public authService = inject(AuthService);

  get isAdmin() {
    return this.authService.hasRole(['Admin']);
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.isAdmin) {
      this.fetchLogs();
      this.fetchPlatformUsers();
    }
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
        this.platformUsers = users;
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
