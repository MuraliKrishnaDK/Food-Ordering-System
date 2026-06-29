import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {

  orderId: number = null;
  saving = true;

  constructor(
    private router: Router,
    private cartService: CartService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (sessionStorage.getItem('userData') == null) {
      this.router.navigate(['login']);
      return;
    }

    const cartMeta = sessionStorage.getItem('fdCartMetaMap');
    const cartMap  = sessionStorage.getItem('fdCartMap');
    const total    = parseFloat(sessionStorage.getItem('total') || '0');
    const userData = JSON.parse(sessionStorage.getItem('userData'));

    if (!cartMeta || !userData) {
      this.saving = false;
      this.cartService.clearCart();
      return;
    }

    const metaMap: { [key: string]: { name: string; basePrice: number } } =
      JSON.parse(cartMeta);
    const qtyMap: { [key: string]: number } = cartMap ? JSON.parse(cartMap) : {};

    const items = Object.keys(metaMap)
      .filter(key => (qtyMap[key] || 0) > 0)
      .map(key => ({
        name: metaMap[key].name,
        quantity: qtyMap[key] || 1,
        unitPrice: metaMap[key].basePrice,
        lineTotal: +((qtyMap[key] || 1) * metaMap[key].basePrice).toFixed(2)
      }));

    const payload = {
      username: userData.username,
      items: JSON.stringify(items),
      total
    };

    this.http.post<any>(`${environment.apiUrl}/orders`, payload).subscribe(
      res => {
        this.saving = false;
        if (res && res.status) {
          this.orderId = res.orderId;
        }
        this.clearSession();
      },
      () => {
        this.saving = false;
        this.clearSession();
      }
    );
  }

  private clearSession(): void {
    this.cartService.clearCart();
    sessionStorage.removeItem('fdCartMap');
    sessionStorage.removeItem('fdCartMetaMap');
    sessionStorage.removeItem('total');
  }

  goToHistory() {
    this.router.navigate(['orderHistory']);
  }

  goToMenu() {
    this.router.navigate(['menu']);
  }
}
