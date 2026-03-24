import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { AppComponent, User } from "../app.component";
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  model:Login={
    username:'',
    password:''
  };

  message:string=null;

  constructor(private http:HttpClient, private router:Router) { }

  ngOnInit() {
    if (sessionStorage.length > 0) {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      if (userData && userData.merchant) {
        this.router.navigate(['merchantWelcome']);
      } else {
        this.router.navigate(['menu']);
      }
    }
  }

  sendFeedback(): void {
    let url = `${environment.apiUrl}/login`;
    let key='userData';
    this.http.post<User>(url,this.model).subscribe(
      res => {
        // localStorage.setItem(key,JSON.stringify(res));
        sessionStorage.setItem(key,JSON.stringify(res));
        if(res!=null && !res.merchant) {
          this.router.navigate(['menu']);
        }
        if(res!=null && res.merchant){
          this.router.navigate(['merchantWelcome']);
        }
        if(res==null) {
          this.message = "Username Or Password is Wrong";
          sessionStorage.clear();
        }
      },
      err=>{
        console.log([this.model]);
        alert("An error has occurred while logging in");
      }
    )
  }
}

export interface Login {
  username:string;
  password:string;
}


