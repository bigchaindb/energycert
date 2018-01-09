import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { FormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { ConfigService } from './shared/config.service'
import { AuthService } from './shared/auth.service'
import { BdbService } from './shared/bdb.service'
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { TestComponent } from './test/test.component'

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ProfileComponent,
    LoginComponent,
    TestComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    BrowserAnimationsModule,
    FormsModule,
  ],
  providers: [ConfigService, AuthService, BdbService],
  bootstrap: [AppComponent]
})
export class AppModule { }
