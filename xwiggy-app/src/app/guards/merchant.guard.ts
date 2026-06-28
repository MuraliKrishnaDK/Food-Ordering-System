import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MerchantGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const data = sessionStorage.getItem('userData');
    if (data) {
      const user = JSON.parse(data);
      if (user && user.merchant === true) {
        return true;
      }
    }
    this.router.navigate(['login']);
    return false;
  }
}
