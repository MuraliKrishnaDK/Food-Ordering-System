import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import {Router, RouterModule, Routes} from "@angular/router";
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { FormsModule} from "@angular/forms";
import { HttpClientModule} from "@angular/common/http";
import { WelcomeComponent } from './welcome/welcome.component';
import { MenuComponent } from './menu/menu.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SuccessComponent } from './success/success.component';
import { MerchantWelcomeComponent } from './merchant-welcome/merchant-welcome.component';
import { MerchantMenuComponent } from './merchant-menu/merchant-menu.component';
import { AddItemComponent } from './add-item/add-item.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { SettingsComponent } from './settings/settings.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { AuthGuard } from './guards/auth.guard';
import { MerchantGuard } from './guards/merchant.guard';
import { NotFoundComponent } from './not-found/not-found.component';

const appRoutes:Routes=[
  {path:'login',     component:LoginComponent},
  {path:'register',  component:RegisterComponent},
  {path:'home',      component:HomeComponent},
  {path:'',          component:HomeComponent},
  {path:'forgotPassword', component:ForgotPasswordComponent},
  {path:'resetPassword',  component:ResetPasswordComponent},

  // Customer-only routes
  {path:'welcome',      component:WelcomeComponent,      canActivate:[AuthGuard]},
  {path:'menu',         component:MenuComponent,          canActivate:[AuthGuard]},
  {path:'checkout',     component:CheckoutComponent,      canActivate:[AuthGuard]},
  {path:'success',      component:SuccessComponent,       canActivate:[AuthGuard]},
  {path:'orderHistory', component:OrderHistoryComponent,  canActivate:[AuthGuard]},
  {path:'contactUs',    component:ContactUsComponent,     canActivate:[AuthGuard]},
  {path:'settings',     component:SettingsComponent,      canActivate:[AuthGuard]},

  // Merchant-only routes
  {path:'merchantWelcome', component:MerchantWelcomeComponent, canActivate:[AuthGuard, MerchantGuard]},
  {path:'merchantMenu',    component:MerchantMenuComponent,    canActivate:[AuthGuard, MerchantGuard]},
  {path:'addItem',         component:AddItemComponent,         canActivate:[AuthGuard, MerchantGuard]},

  // 404
  {path:'**', component:NotFoundComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    WelcomeComponent,
    MenuComponent,
    CheckoutComponent,
    SuccessComponent,
    MerchantWelcomeComponent,
    MerchantMenuComponent,
    AddItemComponent,
    ContactUsComponent,
    SettingsComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    OrderHistoryComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes,{useHash: true}),
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
