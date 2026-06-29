import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../cart.service';
import { CartSidebarService } from './cart-sidebar.service';

export interface SidebarLineItem {
  key: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

@Component({
  selector: 'app-cart-sidebar',
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css']
})
export class CartSidebarComponent implements OnInit, OnDestroy {

  isOpen = false;
  lineItems: SidebarLineItem[] = [];
  grandTotal = 0;

  private subs: Subscription[] = [];

  constructor(
    private sidebarService: CartSidebarService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subs.push(
      this.sidebarService.isOpen$.subscribe(open => {
        this.isOpen = open;
        if (open) { this.refresh(); }
      }),
      this.cartService.cartCount$.subscribe(() => {
        if (this.isOpen) { this.refresh(); }
      })
    );
  }

  refresh(): void {
    const rawCart = sessionStorage.getItem('fdCartMap');
    const rawMeta = sessionStorage.getItem('fdCartMetaMap');
    let cartMap: { [k: string]: number } = {};
    let metaMap: { [k: string]: { name: string; basePrice: number } } = {};
    try { cartMap = rawCart ? JSON.parse(rawCart) : {}; } catch { cartMap = {}; }
    try { metaMap = rawMeta ? JSON.parse(rawMeta) : {}; } catch { metaMap = {}; }

    this.lineItems = Object.keys(cartMap)
      .filter(k => (cartMap[k] || 0) > 0)
      .map(k => {
        const qty   = cartMap[k];
        const meta  = metaMap[k] || { name: k.split('::').slice(2).join('::') || k, basePrice: 0 };
        return {
          key: k,
          name: meta.name,
          quantity: qty,
          unitPrice: meta.basePrice,
          lineTotal: +(meta.basePrice * qty).toFixed(2)
        } as SidebarLineItem;
      });

    this.grandTotal = +this.lineItems.reduce((s, i) => s + i.lineTotal, 0).toFixed(2);
  }

  removeItem(item: SidebarLineItem): void {
    const rawCart = sessionStorage.getItem('fdCartMap');
    const rawMeta = sessionStorage.getItem('fdCartMetaMap');
    let cartMap: { [k: string]: number } = {};
    let metaMap: { [k: string]: any } = {};
    try { cartMap = rawCart ? JSON.parse(rawCart) : {}; } catch {}
    try { metaMap = rawMeta ? JSON.parse(rawMeta) : {}; } catch {}

    delete cartMap[item.key];
    delete metaMap[item.key];
    sessionStorage.setItem('fdCartMap', JSON.stringify(cartMap));
    sessionStorage.setItem('fdCartMetaMap', JSON.stringify(metaMap));

    const newCount = Object.values(cartMap).reduce((s: number, v: number) => s + v, 0);
    const newTotal = Object.keys(cartMap).reduce((s, k) => {
      const base = metaMap[k] ? metaMap[k].basePrice : 0;
      return s + base * cartMap[k];
    }, 0);
    sessionStorage.setItem('total', newTotal.toFixed(2));
    this.cartService.updateCount(newCount as number);
    this.refresh();
  }

  checkout(): void {
    this.sidebarService.close();
    this.router.navigate(['/checkout']);
  }

  browseMenu(): void {
    this.sidebarService.close();
    this.router.navigate(['/menu']);
  }

  close(): void { this.sidebarService.close(); }

  @HostListener('document:keydown.escape')
  onEsc(): void { this.sidebarService.close(); }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
