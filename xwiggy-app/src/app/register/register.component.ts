import { Component, OnInit } from '@angular/core';
import { AppComponent, User } from '../app.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  model: User = { username:'', password:'', firstname:'', lastname:'', email:'', address:'', phone:null, merchant:null };
  options = 'User';
  present: boolean = null;
  usernameAvailability: string;
  fontColor: string;
  emailValidation = true;
  passwordValidation = true;
  submitAttempted = false;

  constructor(private http: HttpClient, private router: Router, private toast: ToastService) {}

  ngOnInit() { this.model.merchant = false; }

  usernamePresent(): void {
    this.fontColor = '';
    this.http.post<boolean>(`${environment.apiUrl}/checkUserName`, this.model.username).subscribe(res => {
      this.present = res;
      if (this.present) { this.fontColor = 'red';   this.usernameAvailability = 'Username already taken'; }
      else              { this.fontColor = 'green';  this.usernameAvailability = 'Available'; }
    });
  }

  updateSelect() {
    this.model.merchant = this.options === 'Merchant';
  }

  checkEmail() {
    if (!this.model.email.length) { this.emailValidation = true; return; }
    this.emailValidation = this.model.email.includes('@');
  }

  passwordStrength() {
    if (!this.model.password.length) { this.passwordValidation = true; return; }
    if (this.model.password.length < 8) { this.passwordValidation = false; return; }
    const m = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,16})/.test(this.model.password);
    this.passwordValidation = m;
  }

  onSubmit(form: any): void {
    this.submitAttempted = true;
    this.checkEmail();
    this.passwordStrength();
    if (!this.emailValidation || !this.passwordValidation || !form.form.valid) {
      const errors: string[] = [];
      if (!this.emailValidation)    errors.push('Enter a valid email address (must contain @)');
      if (!this.passwordValidation) errors.push('Password: 8–16 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character');
      this.toast.error(errors.join(' • '));
      return;
    }
    this.registerUser();
  }

  registerUser(): void {
    this.updateSelect();
    this.model.address = 'Not provided';
    this.model.phone = 0;
    this.http.post<User>(`${environment.apiUrl}/register`, this.model).subscribe(
      res => {
        AppComponent.modelUser = res;
        sessionStorage.setItem('userData', JSON.stringify(res));
        this.router.navigate(['welcome']);
      },
      err => {
        const body = err?.error;
        const msg = body?.message
          || (Array.isArray(body?.errors) ? body.errors.join(' • ') : null)
          || 'An error occurred during registration. Please try again.';
        this.toast.error(msg);
      }
    );
  }
}
