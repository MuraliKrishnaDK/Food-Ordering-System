import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subs: Subscription[] = [];
  private readonly exitMs = 300;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subs.push(
      this.toastService.toasts$.subscribe(t => {
        this.toasts = [...this.toasts, t];
      }),
      this.toastService.remove$.subscribe(id => this.dismiss(id))
    );
  }

  dismiss(id: number) {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast || toast.exiting) {
      return;
    }
    toast.exiting = true;
    this.toasts = [...this.toasts];
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, this.exitMs);
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
