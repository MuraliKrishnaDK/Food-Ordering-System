import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  email: string = '';
  code: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = null;
  errorMessage: string = null;
  loading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const stored = sessionStorage.getItem('resetEmail');
    if (!stored) {
      this.router.navigate(['/forgotPassword']);
      return;
    }
    this.email = stored;
  }

  submit(): void {
    this.message = null;
    this.errorMessage = null;

    if (!this.code || this.code.trim() === '') {
      this.errorMessage = 'Please enter the 6-digit code from your email.';
      return;
    }
    if (!this.newPassword || this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    const url = `${environment.apiUrl}/password-reset/confirm`;

    this.http.post<any>(url, {
      email: this.email,
      code: this.code.trim(),
      newPassword: this.newPassword
    }).subscribe(
      res => {
        this.loading = false;
        if (res && res.status) {
          sessionStorage.removeItem('resetEmail');
          this.message = 'Password updated successfully! Redirecting to login...';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.errorMessage = (res && res.msg) ? res.msg : 'Something went wrong. Try again.';
        }
      },
      err => {
        this.loading = false;
        this.errorMessage = 'Could not connect to the server. Please try again.';
      }
    );
  }
}
