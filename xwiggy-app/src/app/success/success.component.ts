import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { CartService } from "../cart.service";

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {

  constructor(private router: Router, private cartService: CartService) { }

  ngOnInit() {
    if (sessionStorage.getItem('userData') == null) {
      this.router.navigate(['login']);
      return;
    }
    if (sessionStorage.getItem('total') == null) {
      this.router.navigate(['menu']);
      return;
    }
    // Clear cart data; keep userData so the user stays logged in
    this.cartService.clearCart();
    sessionStorage.removeItem('fdCartMap');
    sessionStorage.removeItem('fdCartMetaMap');
    sessionStorage.removeItem('total');
  }

  clearLocal() {
    this.cartService.clearCart();
    sessionStorage.removeItem('fdCartMap');
    sessionStorage.removeItem('fdCartMetaMap');
    sessionStorage.removeItem('total');
  }
}
