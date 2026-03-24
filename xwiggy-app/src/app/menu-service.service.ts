import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuServiceService {

  constructor(public HttpClient: HttpClient) { }

  public getItems(): any {
    return this.HttpClient.get(`${environment.apiUrl}/menu`);
  }
}
