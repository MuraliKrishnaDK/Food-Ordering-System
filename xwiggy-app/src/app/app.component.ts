import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CartService } from './cart.service';
import { CartSidebarService } from './cart-sidebar/cart-sidebar.service';
import { ToastService } from './toast/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FoodDoor';

  static total: number;

  static modelUser: User = {
    username: '',
    password: '',
    email: '',
    phone: 0,
    firstname: '',
    lastname: '',
    address: '',
    merchant: null
  };

  cartCount = 0;
  showHeader = false;

  deliveryAddress = '';
  showLocationPopup = false;
  locationFormAddress = '';
  locationLoading = false;

  private readonly locationStorageKey = 'fdDeliveryLocation';

  constructor(
    private router: Router,
    private cartService: CartService,
    public cartSidebar: CartSidebarService,
    private toast: ToastService
  ) {}

  get isMerchantUser(): boolean {
    try {
      const raw = sessionStorage.getItem('userData');
      if (!raw) return false;
      return JSON.parse(raw).merchant === true;
    } catch {
      return false;
    }
  }

  toggleCart(event: Event): void {
    event.preventDefault();
    this.cartSidebar.toggle();
  }

  logout(): void {
    this.cartService.clearCart();
    this.cartSidebar.close();
    sessionStorage.clear();
    localStorage.removeItem('userData');
    this.router.navigate(['/home']);
  }

  ngOnInit() {
    this.cartService.cartCount$.subscribe(count => this.cartCount = count);
    this.loadDeliveryLocation();
    this.updateHeaderVisibility();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateHeaderVisibility();
        this.cartSidebar.close();
      }
    });
  }

  openLocationPopup(): void {
    this.locationFormAddress = this.deliveryAddress;
    this.showLocationPopup = true;
    document.body.style.overflow = 'hidden';
  }

  closeLocationPopup(): void {
    this.showLocationPopup = false;
    this.locationLoading = false;
    document.body.style.overflow = '';
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.toast.error('Geolocation is not supported by your browser.');
      return;
    }

    this.locationLoading = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

        fetch(url, { headers: { Accept: 'application/json' } })
          .then((res) => res.json())
          .then((data) => {
            this.locationFormAddress = data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
            this.locationLoading = false;
          })
          .catch(() => {
            this.locationFormAddress = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
            this.locationLoading = false;
            this.toast.info('Location found. Address lookup unavailable — coordinates saved.');
          });
      },
      () => {
        this.locationLoading = false;
        this.toast.error('Could not get your location. Check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  saveLocation(): void {
    const address = this.locationFormAddress.trim();
    if (!address) {
      return;
    }
    this.deliveryAddress = address;
    localStorage.setItem(this.locationStorageKey, JSON.stringify({
      address: this.deliveryAddress
    }));
    this.closeLocationPopup();
  }

  private loadDeliveryLocation(): void {
    try {
      const raw = localStorage.getItem(this.locationStorageKey);
      if (raw) {
        const data = JSON.parse(raw);
        this.deliveryAddress = data.address || '';
        return;
      }
    } catch {
      /* fall through to profile address */
    }

    try {
      const userRaw = sessionStorage.getItem('userData') || localStorage.getItem('userData');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user.address) {
          this.deliveryAddress = user.address;
        }
      }
    } catch {
      this.deliveryAddress = '';
    }
  }

  private updateHeaderVisibility() {
    const url = this.router.url.split('?')[0];
    this.showHeader = ['/welcome', '/menu', '/checkout', '/success', '/contactUs', '/merchantWelcome', '/merchantMenu', '/addItem', '/settings', '/orderHistory'].some(route =>
      url === route || url.startsWith(route + '/')
    );
  }
}
export interface User{
  username:string;
  password:string;
  firstname:string;
  lastname:string;
  email:string;
  address:string;
  phone:number;
  merchant:boolean;
}

