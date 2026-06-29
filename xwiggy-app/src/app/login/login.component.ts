import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../app.component';
import { ToastService } from '../toast/toast.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  model: Login = { username: '', password: '' };
  message: string = null;
  rememberMe = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    // Restore from localStorage if Remember Me was used last time
    const remembered = localStorage.getItem('userData');
    if (remembered) {
      sessionStorage.setItem('userData', remembered);
      const userData = JSON.parse(remembered);
      if (userData && userData.merchant) { this.router.navigate(['merchantWelcome']); }
      else { this.router.navigate(['menu']); }
      return;
    }
    if (sessionStorage.length > 0) {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      if (userData && userData.merchant) { this.router.navigate(['merchantWelcome']); }
      else { this.router.navigate(['menu']); }
    }
  }

  sendFeedback(): void {
    this.http.post<User>(`${environment.apiUrl}/login`, this.model).subscribe(
      res => {
        sessionStorage.setItem('userData', JSON.stringify(res));
        if (this.rememberMe && res != null) {
          localStorage.setItem('userData', JSON.stringify(res));
        } else {
          localStorage.removeItem('userData');
        }
        if (res != null && !res.merchant) { this.router.navigate(['menu']); }
        if (res != null && res.merchant)  { this.router.navigate(['merchantWelcome']); }
        if (res == null) {
          this.message = 'Username or password is incorrect.';
          sessionStorage.clear();
        }
      },
      () => this.toast.error('An error occurred while logging in. Please try again.')
    );
  }
}

export interface Login { username: string; password: string; }
