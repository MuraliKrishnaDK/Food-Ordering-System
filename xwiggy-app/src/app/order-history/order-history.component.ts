import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface OrderRecord {
  id: number;
  items: string;
  total: number;
  orderedAt: string;
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {

  orders: OrderRecord[] = [];
  loading = true;
  username = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const userData = sessionStorage.getItem('userData');
    if (!userData) { this.router.navigate(['login']); return; }
    this.username = JSON.parse(userData).username;

    this.http.get<OrderRecord[]>(`${environment.apiUrl}/orders/history/${this.username}`)
      .subscribe(
        data => { this.orders = data; this.loading = false; },
        ()   => { this.loading = false; }
      );
  }

  parseItems(raw: string): { name: string; quantity: number; price: number }[] {
    try { return JSON.parse(raw); } catch { return []; }
  }
}
