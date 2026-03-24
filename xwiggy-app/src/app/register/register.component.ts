import { Component, OnInit } from '@angular/core';
import { AppComponent, User } from "../app.component";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private http:HttpClient, private router:Router) { }

  model:User={
    username:'',
    password:'',
    firstname:'',
    lastname:'',
    email:'',
    address:'',
    phone:null,
    merchant:null
  };

  options:string='User';
  present:boolean = null;
  usernameAvailability:string;
  fontColor:string;

  phoneValidation:boolean=true;
  emailValidation:boolean=true;
  passwordValidation:boolean=true;
  submitAttempted:boolean=false;

  usernamePresent():void{
    this.fontColor='';
    let url = `${environment.apiUrl}/checkUserName`;



    this.http.post<boolean>(url,this.model.username).subscribe(
      res=>{
        this.present=res;
        console.log(this.present);
        if(this.present) {
          this.fontColor="red";
          this.usernameAvailability = "UserName Already Taken";
        }
        else {
          this.fontColor="green";
          this.usernameAvailability = "Available";
        }
        this.router.navigate(['register']);
      }
    )
  }

  updateSelect(){
      if (this.options) {
        this.model.merchant = this.options.length !== 4;
      } else {
        this.model.merchant = false;
      }
  }

  checkPhone()
  {
    if (this.model.phone == null || String(this.model.phone).trim() === '') {
      this.phoneValidation = false;
      return;
    }
    const phoneStr = String(this.model.phone).replace(/\D/g, '');
    this.phoneValidation = phoneStr.length === 10;
  }

  checkEmail(){
    if(this.model.email.length==0)
    {
      this.emailValidation=true;
    }
    if(this.model.email.length>0 &&(this.model.email).indexOf("@")==-1)
      this.emailValidation=false;
    if(this.model.email.length>0 &&(this.model.email).indexOf("@")!=-1)
      this.emailValidation=true;
  }

  passwordStrength(){
    if(this.model.password.length==0)
      this.passwordValidation=true;
    if(this.model.password.length<8)
      this.passwordValidation=false;
    if(this.model.password.length>=8)
    {
      let matcher = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,16})');
      this.passwordValidation=matcher.test(this.model.password);
    }
  }

  onSubmit(form: any): void {
    this.submitAttempted = true;
    this.checkPhone();
    this.checkEmail();
    this.passwordStrength();

    if (!this.emailValidation || !this.phoneValidation || !this.passwordValidation || !form.form.valid) {
      const errors: string[] = [];
      if (!this.emailValidation) errors.push('Enter a valid email address (must contain @)');
      if (!this.phoneValidation) errors.push('Enter a valid 10-digit phone number');
      if (!this.passwordValidation) errors.push('Password must be 8-16 chars with: 1 uppercase, 1 lowercase, 1 number, 1 special character (!@#$%^&*)');
      alert('Please fix the following:\n\n' + errors.join('\n'));
      return;
    }

    this.registerUser();
  }

  registerUser():void{
    this.updateSelect();

    let url = `${environment.apiUrl}/register`;
    this.http.post<User>(url,this.model).subscribe(
      res=>{
        AppComponent.modelUser =res;
        this.router.navigate(['welcome']);
      },
      err=>{
        console.log([this.model]);
        alert("An error has occurred while Registering");
      }
    )
  }

  ngOnInit() {
    this.model.merchant = false;
  }

}
