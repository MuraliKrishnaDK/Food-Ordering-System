import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../app.component';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-welcom',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  modelUser: User = {
    username: '', password: '', email: '',
    phone: 0, firstname: '', lastname: '',
    address: '', merchant: null
  };

  editUser: any = {};
  isEditing = false;
  saving = false;
  errorMessage: string = null;
  successMessage: string = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    if (sessionStorage.getItem('userData') == null) {
      this.router.navigate(['login']);
      return;
    }
    Object.assign(this.modelUser, JSON.parse(sessionStorage.getItem('userData')));
  }

  startEdit() {
    this.editUser = {
      firstname: this.modelUser.firstname || '',
      lastname:  this.modelUser.lastname  || '',
      email:     this.modelUser.email     || '',
      phone:     this.modelUser.phone     ? String(this.modelUser.phone) : '',
      address:   this.modelUser.address   || ''
    };
    this.errorMessage = null;
    this.successMessage = null;
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.errorMessage = null;
  }

  saveEdit() {
    if (!this.editUser.firstname || this.editUser.firstname.trim() === '') {
      this.errorMessage = 'First name cannot be empty.';
      return;
    }

    this.saving = true;
    this.errorMessage = null;

    const payload = {
      username:  this.modelUser.username,
      firstname: this.editUser.firstname.trim(),
      lastname:  this.editUser.lastname.trim(),
      email:     this.editUser.email.trim(),
      phone:     this.editUser.phone.trim(),
      address:   this.editUser.address.trim()
    };

    this.http.put<any>(`${environment.apiUrl}/profile/update`, payload).subscribe(
      res => {
        this.saving = false;
        if (res && res.status) {
          Object.assign(this.modelUser, res.user);
          sessionStorage.setItem('userData', JSON.stringify(this.modelUser));
          this.successMessage = 'Profile updated successfully.';
          this.isEditing = false;
          setTimeout(() => this.successMessage = null, 3000);
        } else {
          this.errorMessage = res.msg || 'Could not save. Please try again.';
        }
      },
      () => {
        this.saving = false;
        this.errorMessage = 'Network error. Please try again.';
      }
    );
  }
}
