import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavigationModule } from 'langs-navigation';
import { Tes1Component } from './components/tes1/tes1.component'
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { LangsCookieConsentModule } from 'langs-cookie-consent';
import { BitergoCommonModule } from '../../../bitergo-common/src/public-api';
import { MatomoModule } from 'ngx-matomo';
import { cookieConsentConfiguration } from './langs-cookie-consent.configuration';
import { matomoConfiguration } from './matomo.configuration';

@NgModule({
  declarations: [
    AppComponent,
    Tes1Component
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en'
    }),
    NavigationModule.forRoot(),
    LangsCookieConsentModule.forRoot(
      cookieConsentConfiguration
    ),
    MatomoModule.forRoot(matomoConfiguration),
    BitergoCommonModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
