import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class MerchantGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const raw = sessionStorage.getItem('userData');
    if (!raw) { this.router.navigate(['login']); return false; }
    try {
      const user = JSON.parse(raw);
      if (user && user.merchant === true) return true;
    } catch {}
    this.router.navigate(['welcome']);
    return false;
  }
}
