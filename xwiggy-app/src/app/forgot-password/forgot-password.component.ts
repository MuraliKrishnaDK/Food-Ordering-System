import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  email: string = '';
  message: string = null;
  errorMessage: string = null;
  loading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const userRaw = sessionStorage.getItem('userData');
    if (!userRaw) { return; }
    try {
      const user = JSON.parse(userRaw);
      if (user && user.email) {
        this.email = user.email.trim().toLowerCase();
      }
    } catch { /* ignore malformed session data */ }
  }

  submit(): void {
    this.message = null;
    this.errorMessage = null;

    if (!this.email || this.email.trim() === '') {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.loading = true;
    const url = `${environment.apiUrl}/password-reset/request`;

    this.http.post<any>(url, { email: this.email.trim().toLowerCase() }).subscribe(
      res => {
        this.loading = false;
        if (res && res.status) {
          sessionStorage.setItem('resetEmail', this.email.trim().toLowerCase());
          this.router.navigate(['/resetPassword']);
        } else {
          this.errorMessage = (res && res.msg) ? res.msg : 'Something went wrong. Try again.';
        }
      },
      err => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMessage = environment.production
            ? 'Could not reach the server. Please try again in a moment.'
            : 'Could not reach the backend. Start the Spring Boot server (port 8080) and try again.';
        } else if (err.status >= 500) {
          this.errorMessage = 'The server encountered an error. Please try again or contact support.';
        } else if (err.error && err.error.msg) {
          this.errorMessage = err.error.msg;
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }
    );
  }
}
