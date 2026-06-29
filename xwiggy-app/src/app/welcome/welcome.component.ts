import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../app.component';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface SavedCard {
  lastFour: string;
  holderName: string;
  expiry: string;
  cardType: string;
  billingAddress?: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-welcom',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  modelUser: User = {
    username: '', password: '', email: '',
    phone: 0, firstname: '', lastname: '',
    address: '', merchant: null
  };

  /* ── Active section ── */
  activeSection: 'profile' | 'cards' | 'security' | 'subscription' | 'notifications' = 'profile';

  /* ── Profile ── */
  editUser: any = {};
  isEditing = false;
  saving = false;
  errorMessage: string = null;
  successMessage: string = null;

  /* ── Cards ── */
  savedCards: SavedCard[] = [];
  showCardForm = false;
  editingCardIndex = -1;
  cardError: string = null;
  cardSuccess: string = null;
  cardForm = { number: '', holderName: '', expiry: '', cvv: '', billingAddress: '' };

  /* ── Notifications ── */
  notifPrefs = { orderConfirm: true, statusUpdates: true, promos: false, newsletter: false };
  notifSaving = false;
  notifError: string = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    if (sessionStorage.getItem('userData') == null) {
      this.router.navigate(['login']);
      return;
    }
    Object.assign(this.modelUser, JSON.parse(sessionStorage.getItem('userData')));
    this.loadCards();
    this.loadNotifPrefs();
  }

  setSection(s: 'profile' | 'cards' | 'security' | 'subscription' | 'notifications') {
    this.activeSection = s;
    this.cardError = null;
    this.cardSuccess = null;
    this.showCardForm = false;
  }

  /* ══ PROFILE ══ */
  startEdit() {
    this.editUser = {
      firstname: this.modelUser.firstname || '',
      lastname:  this.modelUser.lastname  || '',
      email:     this.modelUser.email     || '',
      phone:     this.modelUser.phone ? String(this.modelUser.phone) : '',
      address:   this.modelUser.address   || ''
    };
    this.errorMessage = null;
    this.successMessage = null;
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.errorMessage = null;
  }

  saveEdit() {
    if (!this.editUser.firstname || this.editUser.firstname.trim() === '') {
      this.errorMessage = 'First name cannot be empty.';
      return;
    }
    this.saving = true;
    this.errorMessage = null;
    const payload = {
      username:  this.modelUser.username,
      firstname: this.editUser.firstname.trim(),
      lastname:  this.editUser.lastname.trim(),
      email:     this.editUser.email.trim(),
      phone:     this.editUser.phone.trim(),
      address:   this.editUser.address.trim()
    };
    this.http.put<any>(`${environment.apiUrl}/profile/update`, payload).subscribe(
      res => {
        this.saving = false;
        if (res && res.status) {
          Object.assign(this.modelUser, res.user);
          sessionStorage.setItem('userData', JSON.stringify(this.modelUser));
          this.successMessage = 'Profile updated successfully.';
          this.isEditing = false;
          setTimeout(() => this.successMessage = null, 3000);
        } else {
          this.errorMessage = res.msg || 'Could not save. Please try again.';
        }
      },
      () => {
        this.saving = false;
        this.errorMessage = 'Network error. Please try again.';
      }
    );
  }

  /* ══ CARDS ══ */
  private cardsKey(): string {
    return `cards_${this.modelUser.username}`;
  }

  loadCards() {
    const raw = localStorage.getItem(this.cardsKey());
    this.savedCards = raw ? JSON.parse(raw) : [];
  }

  persistCards() {
    localStorage.setItem(this.cardsKey(), JSON.stringify(this.savedCards));
  }

  openAddCard() {
    this.cardForm = { number: '', holderName: '', expiry: '', cvv: '', billingAddress: '' };
    this.editingCardIndex = -1;
    this.cardError = null;
    this.cardSuccess = null;
    this.showCardForm = true;
  }

  editCard(i: number) {
    const c = this.savedCards[i];
    this.cardForm = {
      number: '•••• •••• •••• ' + c.lastFour,
      holderName: c.holderName,
      expiry: c.expiry,
      cvv: '',
      billingAddress: c.billingAddress || ''
    };
    this.editingCardIndex = i;
    this.cardError = null;
    this.cardSuccess = null;
    this.showCardForm = true;
  }

  saveCard() {
    const raw = this.cardForm.number.replace(/\s/g, '');
    const isEdit = this.editingCardIndex >= 0;
    const isPlaceholder = raw.startsWith('••••');

    if (!isEdit || !isPlaceholder) {
      if (!/^\d{13,19}$/.test(raw)) {
        this.cardError = 'Please enter a valid card number.';
        return;
      }
      if (!this.luhnCheck(raw)) {
        this.cardError = 'Card number is invalid.';
        return;
      }
    }

    if (!this.cardForm.holderName.trim()) {
      this.cardError = 'Card holder name is required.';
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(this.cardForm.expiry)) {
      this.cardError = 'Enter expiry as MM/YY.';
      return;
    }
    const [mm, yy] = this.cardForm.expiry.split('/').map(Number);
    const now = new Date();
    const exp = new Date(2000 + yy, mm - 1);
    if (mm < 1 || mm > 12 || exp < now) {
      this.cardError = 'Card has expired or expiry date is invalid.';
      return;
    }
    if (!isEdit && (this.cardForm.cvv.length < 3 || !/^\d+$/.test(this.cardForm.cvv))) {
      this.cardError = 'CVV must be 3 or 4 digits.';
      return;
    }

    const lastFour = isEdit && isPlaceholder
      ? this.savedCards[this.editingCardIndex].lastFour
      : raw.slice(-4);

    const card: SavedCard = {
      lastFour,
      holderName: this.cardForm.holderName.trim().toUpperCase(),
      expiry: this.cardForm.expiry,
      cardType: isEdit && isPlaceholder
        ? this.savedCards[this.editingCardIndex].cardType
        : this.detectCardType(raw),
      billingAddress: this.cardForm.billingAddress.trim() || this.modelUser.address,
      isDefault: isEdit ? this.savedCards[this.editingCardIndex].isDefault : this.savedCards.length === 0
    };

    if (isEdit) {
      this.savedCards[this.editingCardIndex] = card;
      this.cardSuccess = 'Card updated successfully.';
    } else {
      this.savedCards.push(card);
      this.cardSuccess = 'Card added successfully.';
    }
    this.persistCards();
    this.showCardForm = false;
    this.editingCardIndex = -1;
    setTimeout(() => this.cardSuccess = null, 3000);
  }

  cancelCardForm() {
    this.showCardForm = false;
    this.editingCardIndex = -1;
    this.cardError = null;
  }

  removeCard(i: number) {
    const wasDefault = this.savedCards[i].isDefault;
    this.savedCards.splice(i, 1);
    if (wasDefault && this.savedCards.length > 0) {
      this.savedCards[0].isDefault = true;
    }
    this.persistCards();
    this.cardSuccess = 'Card removed.';
    setTimeout(() => this.cardSuccess = null, 2000);
  }

  setDefaultCard(i: number) {
    this.savedCards.forEach((c, idx) => c.isDefault = (idx === i));
    this.persistCards();
    this.cardSuccess = 'Default card updated.';
    setTimeout(() => this.cardSuccess = null, 2000);
  }

  detectCardType(number: string): string {
    const n = number.replace(/\s/g, '');
    if (/^4/.test(n)) { return 'Visa'; }
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) { return 'Mastercard'; }
    if (/^3[47]/.test(n)) { return 'Amex'; }
    if (/^6(?:011|5)/.test(n)) { return 'Discover'; }
    if (/^3(?:0[0-5]|[68])/.test(n)) { return 'Diners'; }
    return 'Card';
  }

  formatCardPreview(number: string): string {
    if (!number) { return '•••• •••• •••• ••••'; }
    const d = number.replace(/\D/g, '');
    const groups = d.match(/.{1,4}/g) || [];
    while (groups.length < 4) { groups.push(''); }
    return groups.map(g => g.padEnd(4, '•').slice(0, 4)).join(' ');
  }

  formatCardNumber(event: any) {
    let v = event.target.value.replace(/\D/g, '').slice(0, 16);
    v = v.replace(/(.{4})/g, '$1 ').trim();
    this.cardForm.number = v;
    event.target.value = v;
  }

  formatExpiry(event: any) {
    let v = event.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) { v = v.slice(0, 2) + '/' + v.slice(2); }
    this.cardForm.expiry = v;
    event.target.value = v;
  }

  private luhnCheck(num: string): boolean {
    let sum = 0;
    let alt = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num[i], 10);
      if (alt) { n *= 2; if (n > 9) { n -= 9; } }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  /* ══ NOTIFICATIONS ══ */
  loadNotifPrefs() {
    const url = `${environment.apiUrl}/profile/notifications/${this.modelUser.username}`;
    this.http.get<any>(url).subscribe(
      res => {
        if (res && res.status && res.preferences) {
          this.notifPrefs = {
            orderConfirm: !!res.preferences.orderConfirm,
            statusUpdates: !!res.preferences.statusUpdates,
            promos: !!res.preferences.promos,
            newsletter: !!res.preferences.newsletter
          };
          return;
        }
        this.loadNotifPrefsFromLocal();
      },
      () => this.loadNotifPrefsFromLocal()
    );
  }

  private loadNotifPrefsFromLocal() {
    const raw = localStorage.getItem(`notif_${this.modelUser.username}`);
    if (raw) { Object.assign(this.notifPrefs, JSON.parse(raw)); }
  }

  saveNotifPrefs() {
    this.notifSaving = true;
    this.notifError = null;
    const url = `${environment.apiUrl}/profile/notifications/${this.modelUser.username}`;
    this.http.put<any>(url, this.notifPrefs).subscribe(
      res => {
        this.notifSaving = false;
        if (res && res.status) {
          if (res.preferences) {
            this.notifPrefs = {
              orderConfirm: !!res.preferences.orderConfirm,
              statusUpdates: !!res.preferences.statusUpdates,
              promos: !!res.preferences.promos,
              newsletter: !!res.preferences.newsletter
            };
          }
          localStorage.setItem(`notif_${this.modelUser.username}`, JSON.stringify(this.notifPrefs));
          this.successMessage = 'Notification preferences saved.';
          setTimeout(() => this.successMessage = null, 3000);
        } else {
          this.notifError = (res && res.msg) ? res.msg : 'Could not save preferences.';
        }
      },
      () => {
        this.notifSaving = false;
        this.notifError = 'Network error. Please try again.';
      }
    );
  }
}
