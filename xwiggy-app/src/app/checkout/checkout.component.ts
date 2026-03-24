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

  validCard(){
    if(this.cardNumber.length==0){
      this.cardNumberVal=null;
    }
    if(this.cardNumber.length>0 && this.cardNumber.length<16){
      this.cardNumberVal=false;
    }else if(this.cardNumber.length==16){
      let matcher = new RegExp('^(?=.*[0-9])(?=.{16})');
      this.cardNumberVal=matcher.test(this.cardNumber);
    }
  }

  validMonth(){
    this.monthVal = this.month >= 1 && this.month <= 12;
    console.log(this.monthVal);
  }

  validCvv(){
    this.cvvVal = this.cvv >=100 && this.cvv <= 999
  }

  validName(){
    this.nameOnCardVal=this.nameOnCard.length>=4 && this.nameOnCard.length<=10;
  }

  message:string='';

  changeDB():void{
    if(this.cardNumberVal&&this.monthVal&&this.yearVal&&this.cvvVal&&this.nameOnCardVal) {
      let url = `${environment.apiUrl}/changeDB`;
      this.http.get(url).subscribe(
        res => {
          console.log("DB Updated");
        },
        err => {
          alert('Failed to update DB');
        }
      )
    }else{
      if(!this.cardNumberVal)
        this.message+="Card Number Not Valid \n";
      if(!this.monthVal)
        this.message+="Enter A Valid Month \n";
      if(!this.yearVal)
        this.message+="Enter A Valid Year\n";
      if(!this.cvvVal)
        this.message+="Enter A Valid CVV \n";
      if(!this.nameOnCardVal)
        this.message+="Enter A Valid Name";

      alert(this.message);
      this.message='';
      this.router.navigate(['checkout']);
    }
  }

  validYear() {
    this.yearVal= this.year>=19 && this.year<=99;
    console.log(this.yearVal);
  }


}
