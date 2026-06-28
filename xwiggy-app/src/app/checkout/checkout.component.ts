import { Component, OnInit } from '@angular/core';
import { AppComponent, User } from "../app.component";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { CartService } from "../cart.service";
import { environment } from '../../environments/environment';

interface CartItemMeta {
  name: string;
  basePrice: number;
}

interface CheckoutLineItem {
  key: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  constructor(private http:HttpClient, private router:Router, private cartService: CartService) { }

  user:User = AppComponent.modelUser;
  total:string;
  lineItems: CheckoutLineItem[] = [];
  grandTotal = 0;
  cardNumberVal:boolean=null;
  monthVal:boolean=null;
  yearVal:boolean=null;
  cvvVal:boolean=null;
  nameOnCardVal:boolean=null;

  cardNumber:string;
  month:number;
  year:number;
  cvv:number;
  nameOnCard:string;


  ngOnInit() {
    if (sessionStorage.getItem("userData") == null) {
      this.router.navigate(['login']);
    }
    this.total=sessionStorage.getItem('total');
    this.loadOrderSummary();
  }

  private loadOrderSummary(): void {
    const rawCart = sessionStorage.getItem('fdCartMap');
    const rawMeta = sessionStorage.getItem('fdCartMetaMap');
    let cartMap: { [key: string]: number } = {};
    let metaMap: { [key: string]: CartItemMeta } = {};

    if (rawCart) {
      try {
        cartMap = JSON.parse(rawCart);
      } catch {
        cartMap = {};
      }
    }

    if (rawMeta) {
      try {
        metaMap = JSON.parse(rawMeta);
      } catch {
        metaMap = {};
      }
    }

    const totalQty = Object.keys(cartMap).reduce((sum, key) => sum + (cartMap[key] || 0), 0);
    const storedTotal = parseFloat(this.total || '0') || 0;
    const fallbackUnitPrice = totalQty > 0 ? +(storedTotal / totalQty).toFixed(2) : 0;

    this.lineItems = Object.keys(cartMap)
      .map((key) => {
        const quantity = cartMap[key] || 0;
        const meta = metaMap[key];
        if (quantity <= 0) {
          return null;
        }
        const inferredName = this.getItemNameFromKey(key);
        const unitPrice = meta ? meta.basePrice : fallbackUnitPrice;
        const lineTotal = +(unitPrice * quantity).toFixed(2);
        return {
          key,
          name: meta ? meta.name : inferredName,
          quantity,
          unitPrice,
          lineTotal
        } as CheckoutLineItem;
      })
      .filter((item): item is CheckoutLineItem => item !== null);

    this.grandTotal = this.lineItems.length > 0
      ? +this.lineItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
      : storedTotal;

    this.syncCartCount();
  }

  private getItemNameFromKey(key: string): string {
    const parts = key.split('::');
    if (parts.length >= 3) {
      return parts.slice(2).join('::');
    }
    return key;
  }

  increaseQuantity(item: CheckoutLineItem): void {
    item.quantity += 1;
    item.lineTotal = +(item.unitPrice * item.quantity).toFixed(2);
    this.persistCheckoutCart();
  }

  decreaseQuantity(item: CheckoutLineItem): void {
    if (item.quantity <= 1) {
      this.lineItems = this.lineItems.filter((row) => row.key !== item.key);
      this.persistCheckoutCart();
      return;
    }
    item.quantity -= 1;
    item.lineTotal = +(item.unitPrice * item.quantity).toFixed(2);
    this.persistCheckoutCart();
  }

  private persistCheckoutCart(): void {
    const nextCartMap: { [key: string]: number } = {};
    this.lineItems.forEach((item) => {
      nextCartMap[item.key] = item.quantity;
    });

    this.grandTotal = +this.lineItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2);
    this.total = this.grandTotal.toFixed(2);
    sessionStorage.setItem('fdCartMap', JSON.stringify(nextCartMap));
    sessionStorage.setItem('total', this.total);
    this.syncCartCount();
  }

  private syncCartCount(): void {
    const count = this.lineItems.reduce((sum, item) => sum + item.quantity, 0);
    this.cartService.updateCount(count);
  }

  /** Luhn algorithm — industry-standard check for real card numbers */
  private luhn(value: string): boolean {
    let sum = 0;
    let alternate = false;
    for (let i = value.length - 1; i >= 0; i--) {
      let n = parseInt(value[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  validCard() {
    if (!this.cardNumber || this.cardNumber.trim().length === 0) {
      this.cardNumberVal = null;
      return;
    }
    const digits = this.cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(digits)) {
      this.cardNumberVal = false;
      return;
    }
    if (digits.length < 13 || digits.length > 19) {
      this.cardNumberVal = false;
      return;
    }
    this.cardNumberVal = this.luhn(digits);
  }

  validMonth() {
    if (!this.month) { this.monthVal = null; return; }
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    const enteredYear = this.year || 0;

    this.monthVal = this.month >= 1 && this.month <= 12;

    if (this.monthVal && enteredYear && enteredYear === currentYear) {
      this.monthVal = this.month >= currentMonth;
    }
    this.validYear();
  }

  validYear() {
    if (!this.year) { this.yearVal = null; return; }
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (this.year < currentYear || this.year > 99) {
      this.yearVal = false;
      return;
    }
    this.yearVal = true;

    if (this.month && this.year === currentYear) {
      this.monthVal = this.month >= currentMonth;
    }
  }

  validCvv() {
    if (!this.cvv) { this.cvvVal = null; return; }
    const cvvStr = String(this.cvv);
    this.cvvVal = /^\d{3,4}$/.test(cvvStr);
  }

  validName() {
    if (!this.nameOnCard || this.nameOnCard.trim().length === 0) {
      this.nameOnCardVal = null;
      return;
    }
    const trimmed = this.nameOnCard.trim();
    this.nameOnCardVal =
      /^[a-zA-Z\s\-']+$/.test(trimmed) &&
      trimmed.length >= 2 &&
      trimmed.length <= 26;
  }

  validationErrors: string[] = [];

  changeDB(): void {
    this.validCard();
    this.validMonth();
    this.validYear();
    this.validCvv();
    this.validName();

    this.validationErrors = [];

    if (!this.cardNumberVal)   this.validationErrors.push('Enter a valid card number.');
    if (!this.monthVal)        this.validationErrors.push('Enter a valid expiry month.');
    if (!this.yearVal)         this.validationErrors.push('Enter a valid expiry year.');
    if (this.monthVal && this.yearVal) {
      const now = new Date();
      const cy = now.getFullYear() % 100;
      const cm = now.getMonth() + 1;
      if (this.year < cy || (this.year === cy && this.month < cm)) {
        this.validationErrors.push('Card has expired.');
        this.monthVal = false;
        this.yearVal = false;
      }
    }
    if (!this.cvvVal)          this.validationErrors.push('Enter a valid CVV (3 or 4 digits).');
    if (!this.nameOnCardVal)   this.validationErrors.push('Enter a valid cardholder name (letters only, 2–26 characters).');

    if (this.validationErrors.length > 0) return;

    const url = `${environment.apiUrl}/changeDB`;
    this.http.get(url).subscribe(
      () => console.log('DB Updated'),
      () => alert('Failed to update. Please try again.')
    );
  }


}
