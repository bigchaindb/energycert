import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { FormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { ConfigService } from './shared/config.service'
import { AuthService } from './shared/auth.service'
import { BdbService } from './shared/bdb.service'
import { XtechService } from './shared/xtech.service'
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { TestComponent } from './test/test.component';
import { BlockchainComponent } from './blockchain/blockchain.component';
import { RegisterComponent } from './register/register.component';
import { MakeOfferComponent } from './dashboard/modals/make-offer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ProfileComponent,
    LoginComponent,
    TestComponent,
    BlockchainComponent,
    RegisterComponent,
    MakeOfferComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    NgbModule.forRoot(),
    FormsModule
  ],
  providers: [ConfigService, AuthService, BdbService, XtechService,HttpModule],
  bootstrap: [AppComponent],
  entryComponents: [MakeOfferComponent]
})
export class AppModule { }
