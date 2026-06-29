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

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subs.push(
      this.toastService.toasts$.subscribe(t => {
        this.toasts = [...this.toasts, t];
      }),
      this.toastService.remove$.subscribe(id => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      })
    );
  }

  dismiss(id: number) {
    this.toastService.remove$.next(id);
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
