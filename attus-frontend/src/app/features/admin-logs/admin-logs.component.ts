import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.css']
})
export class AdminLogsComponent implements OnInit {
  logs: any[] = [];
  loading = true;

  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit() {
    this.http.get<any[]>('http://localhost:3000/api/logs').subscribe({
      next: (data) => {
        this.logs = data.reverse();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
