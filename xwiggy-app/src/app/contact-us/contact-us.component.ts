import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../app.component';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../cart.service';
import { ToastService } from '../toast/toast.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {

  modelUser: User = { username:'', password:'', email:'', phone:0, firstname:'', lastname:'', address:'', merchant:null };
  modelMessage: contact = { name: '', email: '', message: '' };
  gif = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cartService: CartService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    if (sessionStorage.getItem('userData') == null) { this.router.navigate(['login']); return; }
    Object.assign(this.modelUser, JSON.parse(sessionStorage.getItem('userData')));
  }

  sendFeedback() {
    this.gif = true;
    this.modelMessage.name  = this.modelUser.firstname + ' ' + this.modelUser.lastname;
    this.modelMessage.email = this.modelUser.email;
    this.http.post<contact>(`${environment.apiUrl}/contact`, this.modelMessage).subscribe(
      res => {
        this.gif = !res;
        if (res) { this.toast.success('Message sent successfully!'); }
      },
      () => {
        this.gif = false;
        this.toast.error('An error occurred while sending the message.');
      }
    );
  }

  clearLocal() { this.cartService.clearCart(); sessionStorage.clear(); }
}

export interface contact { message: string; name: string; email: string; }
