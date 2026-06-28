import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { User } from "../app.component";
import { HttpClient } from "@angular/common/http";
import { CartService } from "../cart.service";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {

  modelUser: User = {
    username:'',
    password:'',
    email:'',
    phone:0,
    firstname:'',
    lastname:'',
    address:'',
    merchant:null
  };

  modelMessage:contact={
    name:'',
    email:'',
    message:''
  };


  constructor(private http: HttpClient, private router: Router, private cartService: CartService) { }

  ngOnInit() {
    if(sessionStorage.getItem('userData')==null)
      this.router.navigate(["login"]);

    let userData = JSON.parse(sessionStorage.getItem('userData'));
    console.log(userData);
    Object.assign(this.modelUser,userData);
  }

  sending = false;
  successMsg: string = null;
  errorMsg: string = null;

  sendFeedback() {
    if (!this.modelMessage.message || !this.modelMessage.message.trim()) {
      this.errorMsg = 'Please enter a message before sending.';
      return;
    }
    this.sending = true;
    this.successMsg = null;
    this.errorMsg = null;
    this.modelMessage.name  = this.modelUser.firstname + ' ' + this.modelUser.lastname;
    this.modelMessage.email = this.modelUser.email;

    const url = `${environment.apiUrl}/contact`;
    this.http.post<contact>(url, this.modelMessage).subscribe(
      () => {
        this.sending = false;
        this.successMsg = 'Your message has been sent! We will get back to you shortly.';
        this.modelMessage.message = '';
        setTimeout(() => this.successMsg = null, 6000);
      },
      () => {
        this.sending = false;
        this.errorMsg = 'An error occurred while sending your message. Please try again.';
      }
    );
  }

  clearLocal() {
    this.cartService.clearCart();
    sessionStorage.clear();
  }
}



export interface contact {
  message:string;
  name:string;
  email:string;
}
