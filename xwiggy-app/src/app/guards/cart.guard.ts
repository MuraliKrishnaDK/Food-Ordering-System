import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CartGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const countStr = sessionStorage.getItem('cartCount');
    const count = countStr ? parseInt(countStr, 10) : 0;
    if (count > 0) { return true; }
    this.router.navigate(['menu']);
    return false;
  }
}
