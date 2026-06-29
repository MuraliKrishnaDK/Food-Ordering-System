import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartSidebarService {
  private openSource = new BehaviorSubject<boolean>(false);
  isOpen$ = this.openSource.asObservable();

  open()  { this.openSource.next(true);  }
  close() { this.openSource.next(false); }
  toggle() { this.openSource.next(!this.openSource.getValue()); }
}
