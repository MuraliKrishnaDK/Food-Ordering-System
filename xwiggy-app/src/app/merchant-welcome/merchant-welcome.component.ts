import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../app.component';
import { CartService } from '../cart.service';
import { ToastService } from '../toast/toast.service';
import { environment } from '../../environments/environment';

const MENU_ITEMS = [
  'Cheekpeas Pepper Salt','Cheek Peas Pepper Fry','Gobi 65','Baby Corn Manchuria',
  'Gobi Manchuria','Dragon Cauliflower','Chilli Baby Corn','Pepper Baby Corn Fry',
  'Karam Podi Gobi','Coriander Gobi','Veg Manchuria','Chilli Mushroom',
  'Chicken Lollipop','Chicken 65','Crispy Fried Chicken','Chicken Manchuria',
  'Gobi Uttapam','Oats Uttapam','Onion Uttapam','Egg Uttapam',
  'Vada Plate','Poori Plate','Idly Plate','Dosa','Masala Dosa','Rava Dosa',
  'Veg Biryani','Chicken Biryani','Mutton Biryani','Prawn Biryani',
  'Palak Paneer','Paneer Butter Masala','Dal Tadka','Dal Makhani',
  'Butter Chicken','Chicken Tikka Masala','Mutton Rogan Josh',
  'Plain Rice','Jeera Rice','Egg Fried Rice','Veg Fried Rice','Chicken Fried Rice',
  'Tea','Filter Coffee','Green Tea',
  'Fresh Lime Soda','Lassi','Mango Lassi','Oreo Shake','Chocolate Shake'
];

@Component({
  selector: 'app-merchant-welcome',
  templateUrl: './merchant-welcome.component.html',
  styleUrls: ['./merchant-welcome.component.css']
})
export class MerchantWelcomeComponent implements OnInit {

  modelMerchant: User = { username:'', password:'', email:'', phone:0, firstname:'', lastname:'', address:'', merchant:null };
  allItems = MENU_ITEMS;
  outOfStockItems: Set<string> = new Set();
  stockFilter = '';

  get filteredItems(): string[] {
    const q = this.stockFilter.trim().toLowerCase();
    return q ? this.allItems.filter(n => n.toLowerCase().includes(q)) : this.allItems;
  }

  constructor(
    private router: Router,
    private cartService: CartService,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit() {
    if (sessionStorage.getItem('userData') == null) { this.router.navigate(['login']); return; }
    Object.assign(this.modelMerchant, JSON.parse(sessionStorage.getItem('userData')));
    this.loadOutOfStock();
  }

  loadOutOfStock() {
    this.http.get<string[]>(`${environment.apiUrl}/stock/out-of-stock`).subscribe(
      list => { this.outOfStockItems = new Set(list); },
      () => {}
    );
  }

  isOutOfStock(name: string): boolean { return this.outOfStockItems.has(name); }

  toggleStock(name: string) {
    this.http.put<any>(`${environment.apiUrl}/stock/toggle`, name).subscribe(
      res => {
        if (res.inStock) { this.outOfStockItems.delete(name); this.toast.success(`${name} marked In Stock`); }
        else             { this.outOfStockItems.add(name);    this.toast.warning(`${name} marked Out of Stock`); }
        this.outOfStockItems = new Set(this.outOfStockItems);
      },
      () => this.toast.error('Failed to update stock status.')
    );
  }

  clearLocal() { this.cartService.clearCart(); sessionStorage.clear(); }
}
