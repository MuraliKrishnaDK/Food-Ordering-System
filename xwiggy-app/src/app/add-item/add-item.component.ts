import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { ToastService } from '../toast/toast.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {

  newFoodItems: foodItems = { id: '', name: '', price: null, quantityAvailable: null, fileDataF: null };
  selectedFile: any = null;
  url: string = null;
  present: boolean = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cartService: CartService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    if (sessionStorage.length === 0) { this.router.navigate(['welcome']); }
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('newFoodItem', JSON.stringify(this.newFoodItems));
    this.url = (formData.get('file') == null)
      ? `${environment.apiUrl}/addNewItem`
      : `${environment.apiUrl}/addNewItemUrl`;

    this.http.post(this.url, formData).subscribe(
      () => this.toast.success('Item added successfully!'),
      () => this.toast.error('Failed to add item. Please try again.')
    );
  }

  onFileSelected(event: any) { this.selectedFile = event.target.files[0]; }

  checkAvailability() {
    this.http.post<boolean>(`${environment.apiUrl}/checkItemId`, this.newFoodItems.id).subscribe(
      res => { this.present = res; },
      () => this.toast.error('Error checking availability. Try again later.')
    );
  }

  clearLocal() { this.cartService.clearCart(); sessionStorage.clear(); }
}

export interface foodItems {
  id: string; name: string; price: number; quantityAvailable: number; fileDataF: string;
}
