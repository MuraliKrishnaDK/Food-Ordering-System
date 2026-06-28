import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  email: string = '';
  message: string = null;
  errorMessage: string = null;
  loading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

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
        this.errorMessage = 'Could not connect to the server. Please try again.';
      }
    );
  }
}
