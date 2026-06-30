import { Component, OnInit } from '@angular/core';
import { AppComponent, User } from '../app.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { ToastService } from '../toast/toast.service';
import { environment } from '../../environments/environment';

interface CartItemMeta {
  name: string;
  basePrice: number;
  specialInstructions?: string;
}

interface CheckoutLineItem {
  key: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  specialInstructions?: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router, private cartService: CartService, private toast: ToastService) {}

  user:User = AppComponent.modelUser;
  total:string;
  lineItems: CheckoutLineItem[] = [];
  instructionItems: CheckoutLineItem[] = [];
  grandTotal = 0;
  cardNumberVal:boolean=null;
  monthVal:boolean=null;
  yearVal:boolean=null;
  cvvVal:boolean=null;
  nameOnCardVal:boolean=null;

  cardNumber: string;
  month: number;
  year: number;
  cvv: number;
  nameOnCard: string;

  promoCode = '';
  promoApplied = false;
  promoMessage: string = null;
  promoError: string = null;
  promoDiscount = 0;
  finalTotal = 0;
  processingPayment = false;
  showOrderPlacedPopup = false;
  orderPlacedExiting = false;
  placedOrderId: number = null;
  promoFading = false;
  private promoNoticeTimer: number = null;


  ngOnInit() {
    if (sessionStorage.getItem('userData') == null) { this.router.navigate(['login']); }
    this.total = sessionStorage.getItem('total');
    this.loadOrderSummary();
    this.finalTotal = this.grandTotal;
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
          lineTotal,
          specialInstructions: meta ? meta.specialInstructions : undefined
        } as CheckoutLineItem;
      })
      .filter((item): item is CheckoutLineItem => item !== null);

    this.grandTotal = this.lineItems.length > 0
      ? +this.lineItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
      : storedTotal;

    this.syncCartCount();
    this.finalTotal = this.grandTotal;
    this.updateInstructionItems();
  }

  private updateInstructionItems(): void {
    this.instructionItems = this.lineItems.filter(
      item => item.specialInstructions && item.specialInstructions.trim().length > 0
    );
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
      this.removeItem(item);
      return;
    }
    item.quantity -= 1;
    item.lineTotal = +(item.unitPrice * item.quantity).toFixed(2);
    this.persistCheckoutCart();
  }

  applyPromo(): void {
    if (!this.promoCode.trim()) { return; }
    const total = this.grandTotal;
    this.http.post<any>(`${environment.apiUrl}/promo/validate`, { code: this.promoCode, total }).subscribe(
      res => {
        if (res.valid) {
          this.promoApplied = true;
          this.promoDiscount = res.discount;
          this.finalTotal = res.newTotal;
          this.showPromoNotice(res.message, true);
          this.toast.success(`Promo applied: ${res.label}`);
        } else {
          this.promoApplied = false;
          this.promoDiscount = 0;
          this.finalTotal = this.grandTotal;
          this.showPromoNotice(res.message, false);
          this.toast.error(res.message);
        }
      },
      () => {
        this.showPromoNotice('Could not validate promo code. Try again.', false);
        this.toast.error('Could not validate promo code. Try again.');
      }
    );
  }

  private showPromoNotice(message: string, success: boolean): void {
    if (this.promoNoticeTimer) {
      clearTimeout(this.promoNoticeTimer);
      this.promoNoticeTimer = null;
    }
    this.promoFading = false;
    if (success) {
      this.promoMessage = message;
      this.promoError = null;
    } else {
      this.promoError = message;
      this.promoMessage = null;
    }
    this.promoNoticeTimer = window.setTimeout(() => this.fadeOutPromoNotice(), 3000);
  }

  private fadeOutPromoNotice(): void {
    this.promoFading = true;
    window.setTimeout(() => {
      this.promoMessage = null;
      this.promoError = null;
      this.promoFading = false;
      this.promoNoticeTimer = null;
    }, 300);
  }

  removePromo(): void {
    if (this.promoNoticeTimer) {
      clearTimeout(this.promoNoticeTimer);
      this.promoNoticeTimer = null;
    }
    this.promoCode = '';
    this.promoApplied = false;
    this.promoDiscount = 0;
    this.finalTotal = this.grandTotal;
    this.promoMessage = null;
    this.promoError = null;
    this.promoFading = false;
  }

  removeItem(item: CheckoutLineItem): void {
    this.lineItems = this.lineItems.filter((row) => row.key !== item.key);
    this.persistCheckoutCart();
  }

  private persistCheckoutCart(): void {
    const nextCartMap: { [key: string]: number } = {};
    const nextMetaMap: { [key: string]: CartItemMeta } = {};
    const rawMeta = sessionStorage.getItem('fdCartMetaMap');
    let existingMeta: { [key: string]: CartItemMeta } = {};
    if (rawMeta) {
      try { existingMeta = JSON.parse(rawMeta); } catch { existingMeta = {}; }
    }

    this.lineItems.forEach((item) => {
      nextCartMap[item.key] = item.quantity;
      nextMetaMap[item.key] = {
        name: item.name,
        basePrice: item.unitPrice,
        specialInstructions: item.specialInstructions || (existingMeta[item.key] && existingMeta[item.key].specialInstructions)
      };
    });

    this.grandTotal = +this.lineItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2);
    this.total = this.grandTotal.toFixed(2);
    sessionStorage.setItem('fdCartMap', JSON.stringify(nextCartMap));
    sessionStorage.setItem('fdCartMetaMap', JSON.stringify(nextMetaMap));
    sessionStorage.setItem('total', this.total);
    this.syncCartCount();
    this.updateInstructionItems();
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
    const enteredYear = this.normalizeExpiryYear() || 0;

    this.monthVal = this.month >= 1 && this.month <= 12;

    if (this.monthVal && enteredYear && enteredYear === currentYear) {
      this.monthVal = this.month >= currentMonth;
    }
    this.validYear();
  }

  /** Accepts YY (30) or YYYY (2030); stores normalized 2-digit year on the model. */
  private normalizeExpiryYear(): number | null {
    if (this.year === null || this.year === undefined) {
      return null;
    }
    const raw = Number(this.year);
    if (isNaN(raw)) {
      return null;
    }
    if (raw >= 2000 && raw <= 2099) {
      const normalized = raw % 100;
      this.year = normalized;
      return normalized;
    }
    if (raw >= 0 && raw <= 99) {
      return raw;
    }
    // e.g. 203 while user is still typing 2030
    return null;
  }

  validYear() {
    const normalized = this.normalizeExpiryYear();
    if (normalized === null) {
      this.yearVal = this.year !== null && this.year !== undefined && Number(this.year) >= 100
        ? null
        : (this.year ? false : null);
      return;
    }
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (normalized < currentYear || normalized > 99) {
      this.yearVal = false;
      return;
    }
    this.yearVal = true;

    if (this.month && normalized === currentYear) {
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

  placeOrder(): void {
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
      const expiryYear = this.normalizeExpiryYear() || 0;
      if (expiryYear < cy || (expiryYear === cy && this.month < cm)) {
        this.validationErrors.push('Card has expired.');
        this.monthVal = false;
        this.yearVal = false;
      }
    }
    if (!this.cvvVal)          this.validationErrors.push('Enter a valid CVV (3 or 4 digits).');
    if (!this.nameOnCardVal)   this.validationErrors.push('Enter a valid cardholder name (letters only, 2–26 characters).');

    if (this.validationErrors.length > 0) return;

    if (this.lineItems.length === 0) {
      this.toast.error('Your cart is empty.');
      return;
    }

    const userRaw = sessionStorage.getItem('userData');
    if (!userRaw) {
      this.router.navigate(['login']);
      return;
    }

    this.processingPayment = true;
    const userData = JSON.parse(userRaw);
    const items = this.lineItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      specialInstructions: item.specialInstructions
    }));

    const orderPayload = {
      username: userData.username,
      items: JSON.stringify(items),
      total: this.finalTotal
    };

    this.http.post<any>(`${environment.apiUrl}/orders`, orderPayload).subscribe(
      (res) => {
        this.processingPayment = false;
        if (res && res.status) {
          this.placedOrderId = res.orderId;
          sessionStorage.setItem('highlightOrderId', String(res.orderId));
          this.clearCartAfterOrder();
          this.showOrderPlacedPopup = true;
          this.orderPlacedExiting = false;
          window.setTimeout(() => {
            this.orderPlacedExiting = true;
            window.setTimeout(() => {
              this.showOrderPlacedPopup = false;
              this.orderPlacedExiting = false;
              this.router.navigate(['/orderHistory']);
            }, 300);
          }, 3000);
        } else {
          this.toast.error((res && res.msg) ? res.msg : 'Order could not be placed. Please try again.');
        }
      },
      () => {
        this.processingPayment = false;
        this.toast.error('Order could not be placed. Please try again.');
      }
    );
  }

  private clearCartAfterOrder(): void {
    this.cartService.clearCart();
    sessionStorage.removeItem('fdCartMap');
    sessionStorage.removeItem('fdCartMetaMap');
    sessionStorage.removeItem('total');
    this.lineItems = [];
    this.instructionItems = [];
    this.grandTotal = 0;
    this.finalTotal = 0;
  }


}
