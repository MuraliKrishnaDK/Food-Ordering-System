import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MenuServiceService } from '../menu-service.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CartService } from '../cart.service';
import { environment } from '../../environments/environment';
import { menu } from '../menu/menu.component';

@Component({
  selector: 'app-merchant-menu',
  templateUrl: './merchant-menu.component.html',
  styleUrls: ['./merchant-menu.component.css']
})
export class MerchantMenuComponent implements OnInit {

  model: menu[] = [];
  loading = true;
  successMessage: string = null;
  errorMessage: string = null;

  editingId: string = null;
  editForm: { item: string; price: number; quantity: number; url: string } = {
    item: '', price: 0, quantity: 0, url: ''
  };
  saving = false;

  deleteConfirmId: string = null;
  deleting = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private menuService: MenuServiceService,
    public sanitizer: DomSanitizer,
    private cartService: CartService
  ) {}

  ngOnInit() {
    if (sessionStorage.getItem('userData') == null) {
      this.router.navigate(['login']);
      return;
    }
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.menuService.getItems().subscribe(
      (items: any[]) => { this.model = items; this.loading = false; },
      () => { this.loading = false; this.errorMessage = 'Failed to load menu items.'; }
    );
  }

  startEdit(item: menu): void {
    this.editingId = item.id;
    this.editForm = {
      item: item.item,
      price: item.price,
      quantity: item.quantity,
      url: item.url || ''
    };
    this.successMessage = null;
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(item: menu): void {
    if (!this.editForm.item.trim()) {
      this.errorMessage = 'Item name cannot be empty.';
      return;
    }
    this.saving = true;
    this.http.put<any>(`${environment.apiUrl}/menu/${item.id}`, this.editForm).subscribe(
      res => {
        this.saving = false;
        if (res && res.status) {
          Object.assign(item, res.item);
          this.editingId = null;
          this.successMessage = `"${item.item}" updated successfully.`;
          setTimeout(() => this.successMessage = null, 3000);
        } else {
          this.errorMessage = res.msg || 'Could not update item.';
        }
      },
      () => { this.saving = false; this.errorMessage = 'Network error. Try again.'; }
    );
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteItem(item: menu): void {
    this.deleting = true;
    this.http.delete<any>(`${environment.apiUrl}/menu/${item.id}`).subscribe(
      res => {
        this.deleting = false;
        this.deleteConfirmId = null;
        if (res && res.status) {
          this.model = this.model.filter(m => m.id !== item.id);
          this.successMessage = `"${item.item}" deleted.`;
          setTimeout(() => this.successMessage = null, 3000);
        } else {
          this.errorMessage = res.msg || 'Could not delete item.';
        }
      },
      () => { this.deleting = false; this.errorMessage = 'Network error. Try again.'; }
    );
  }

  toggleStock(item: menu): void {
    this.http.patch<any>(`${environment.apiUrl}/menu/${item.id}/stock`, {}).subscribe(
      res => {
        if (res && res.status !== undefined) {
          item.inStock = res.inStock;
          const label = item.inStock ? 'in stock' : 'out of stock';
          this.successMessage = `"${item.item}" marked as ${label}.`;
          setTimeout(() => this.successMessage = null, 3000);
        }
      },
      () => { this.errorMessage = 'Could not update stock status.'; }
    );
  }

  clearLocal(): void {
    this.cartService.clearCart();
    sessionStorage.clear();
  }
}
