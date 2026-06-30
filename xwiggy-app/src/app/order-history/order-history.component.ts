import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Order {
  id: number;
  username: string;
  items: string;
  total: number;
  status: string;
  deliveryCode?: string;
  createdAt: string;
  parsedItems?: OrderItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {

  orders: Order[] = [];
  currentOrders: Order[] = [];
  pastOrders: Order[] = [];
  highlightOrderId: number = null;
  loading = true;
  error: string = null;
  currentPage = 0;
  totalPages = 1;
  pageSize = 10;

  /** Live display status per order (may advance ahead during simulation) */
  displayStatuses: { [id: number]: string } = {};
  private orderTimers: number[] = [];

  readonly statusSteps = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  readonly statusLabels: { [key: string]: string } = {
    PLACED: 'Order Placed',
    CONFIRMED: 'Confirmed',
    PREPARING: 'Preparing',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered'
  };
  readonly statusColors: { [key: string]: string } = {
    PLACED: '#f4a422',
    CONFIRMED: '#29b6f6',
    PREPARING: '#ab47bc',
    OUT_FOR_DELIVERY: '#ff7043',
    DELIVERED: '#66bb6a'
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const userData = sessionStorage.getItem('userData');
    if (!userData) { this.router.navigate(['login']); return; }

    const highlight = sessionStorage.getItem('highlightOrderId');
    if (highlight) {
      this.highlightOrderId = parseInt(highlight, 10);
      sessionStorage.removeItem('highlightOrderId');
    }

    this.loadOrders(JSON.parse(userData).username);
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  loadOrders(username: string, page = 0) {
    this.loading = true;
    this.error = null;
    this.clearTimers();
    const url = `${environment.apiUrl}/orders/user/${username}?page=${page}&size=${this.pageSize}`;
    this.http.get<any>(url).subscribe(
      res => {
        this.loading = false;
        this.orders = (res.orders || []).map((o: Order) => ({
          ...o,
          parsedItems: this.parseItems(o.items),
          expanded: this.highlightOrderId === o.id
        }));
        this.initDisplayStatuses();
        this.splitOrdersByTimeline();
        this.startSimulationsForActiveOrders();
        this.totalPages = res.totalPages || 1;
        this.currentPage = res.currentPage || 0;
      },
      () => {
        this.loading = false;
        this.error = 'Could not load orders. Please try again.';
      }
    );
  }

  private initDisplayStatuses(): void {
    this.displayStatuses = {};
    this.orders.forEach(o => {
      this.displayStatuses[o.id] = o.status;
    });
  }

  private startSimulationsForActiveOrders(): void {
    this.currentOrders.forEach(order => this.scheduleNextTransition(order));
  }

  private scheduleNextTransition(order: Order): void {
    const current = this.displayStatuses[order.id] || order.status;
    const idx = this.statusSteps.indexOf(current);
    if (idx < 0 || idx >= this.statusSteps.length - 1) {
      return;
    }

    const delay = this.getRandomStageDelay(current);
    const timer = window.setTimeout(() => {
      const nextStatus = this.statusSteps[idx + 1];
      this.displayStatuses[order.id] = nextStatus;
      order.status = nextStatus;
      this.updateOrderStatusOnServer(order.id, nextStatus);

      if (nextStatus === 'DELIVERED') {
        this.splitOrdersByTimeline();
      } else {
        this.scheduleNextTransition(order);
      }
    }, delay);

    this.orderTimers.push(timer);
  }

  private updateOrderStatusOnServer(orderId: number, status: string): void {
    this.http.put<any>(`${environment.apiUrl}/orders/${orderId}/status`, { status }).subscribe();
  }

  private clearTimers(): void {
    this.orderTimers.forEach(t => clearTimeout(t));
    this.orderTimers = [];
  }

  /** Random wait (ms) within minute ranges for each delivery stage */
  private getRandomStageDelay(status: string): number {
    switch (status) {
      case 'PLACED':           return this.randomDelayMinutes(1, 3);
      case 'CONFIRMED':        return this.randomDelayMinutes(10, 15);
      case 'PREPARING':        return this.randomDelayMinutes(15, 20);
      case 'OUT_FOR_DELIVERY': return this.randomDelayMinutes(10, 15);
      default:                 return 60000;
    }
  }

  private randomDelayMinutes(minMinutes: number, maxMinutes: number): number {
    const minMs = minMinutes * 60 * 1000;
    const maxMs = maxMinutes * 60 * 1000;
    return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
  }

  private splitOrdersByTimeline(): void {
    this.currentOrders = this.orders
      .filter(o => this.getDisplayStatus(o) !== 'DELIVERED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.pastOrders = this.orders
      .filter(o => this.getDisplayStatus(o) === 'DELIVERED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private parseItems(raw: string): OrderItem[] {
    try { return JSON.parse(raw) || []; } catch { return []; }
  }

  getUsername(): string {
    const d = sessionStorage.getItem('userData');
    return d ? JSON.parse(d).username : '';
  }

  getDisplayStatus(order: Order): string {
    return this.displayStatuses[order.id] || order.status;
  }

  getDeliveryCode(order: Order): string {
    if (order.deliveryCode) {
      return order.deliveryCode;
    }
    const code = (order.id * 7919) % 10000;
    return String(code).padStart(4, '0');
  }

  getItemSummary(order: Order): string {
    const items = order.parsedItems || [];
    if (items.length === 0) { return '—'; }
    if (items.length === 1) {
      return items[0].name;
    }
    return items[0].name + ' + ' + (items.length - 1) + ' more';
  }

  getTotalItems(order: Order): number {
    return (order.parsedItems || []).reduce((sum, i) => sum + i.quantity, 0);
  }

  toggleExpand(order: Order) { order.expanded = !order.expanded; }

  togglePastOrderExpand(order: Order) {
    order.expanded = !order.expanded;
  }

  getStatusIndex(status: string): number {
    return this.statusSteps.indexOf(status);
  }

  /** Progress % between 0–100 for smooth line meter */
  getProgressPercent(order: Order): number {
    const status = this.getDisplayStatus(order);
    const idx = this.getStatusIndex(status);
    if (idx < 0) { return 0; }
    if (idx >= this.statusSteps.length - 1) { return 100; }
    const segmentWidth = 100 / (this.statusSteps.length - 1);
    return idx * segmentWidth + segmentWidth * 0.5;
  }

  prevPage() {
    if (this.currentPage > 0) { this.loadOrders(this.getUsername(), this.currentPage - 1); }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) { this.loadOrders(this.getUsername(), this.currentPage + 1); }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) { return ''; }
    const normalized = dateStr.replace(' ', 'T').replace(/\.\d+/, '');
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const year = +match[1];
      const month = +match[2];
      const day = +match[3];
      const hour = +match[4];
      const minute = +match[5];
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      const mm = minute < 10 ? '0' + minute : String(minute);
      return monthNames[month - 1] + ' ' + day + ', ' + year + ' '
        + h12 + ':' + mm + ' ' + ampm + ' ET';
    }
    return new Date(dateStr).toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET';
  }
}
