import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CartService } from './cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FoodDoor';

  static total: number;

  static modelUser: User = {
    username: '',
    password: '',
    email: '',
    phone: 0,
    firstname: '',
    lastname: '',
    address: '',
    merchant: null
  };

  cartCount = 0;
  showHeader = false;

  constructor(private router: Router, private cartService: CartService) {}

  get isMerchantUser(): boolean {
    try {
      const raw = sessionStorage.getItem('userData');
      if (!raw) return false;
      return JSON.parse(raw).merchant === true;
    } catch {
      return false;
    }
  }

  logout(): void {
    this.cartService.clearCart();
    sessionStorage.clear();
    this.router.navigate(['/home']);
  }

  ngOnInit() {
    this.cartService.cartCount$.subscribe(count => this.cartCount = count);
    this.updateHeaderVisibility();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateHeaderVisibility();
      }
    });
  }

  private updateHeaderVisibility() {
    const url = this.router.url.split('?')[0];
    this.showHeader = ['/welcome', '/menu', '/checkout', '/success', '/contactUs', '/merchantWelcome', '/merchantMenu', '/addItem', '/settings'].some(route =>
      url === route || url.startsWith(route + '/')
    );
  }
}
export interface User{
  username:string;
  password:string;
  firstname:string;
  lastname:string;
  email:string;
  address:string;
  phone:number;
  merchant:boolean;
}

