import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private idCounter = 0;
  toasts$ = new Subject<Toast>();
  remove$ = new Subject<number>();

  show(message: string, type: Toast['type'] = 'info', duration = 3500): void {
    const id = ++this.idCounter;
    this.toasts$.next({ id, message, type, duration });
    setTimeout(() => this.remove$.next(id), duration);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error', 4500); }
  info(msg: string)    { this.show(msg, 'info'); }
  warning(msg: string) { this.show(msg, 'warning'); }
}
