import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {FacebookMessengerService} from './facebook-messenger.service';
import {DebugComponent} from "./debug/debug.component";
import {AppComponent} from "./app.component";
import {DefaultComponent} from './default/default.component';
import {ServiceWorkerModule} from "@angular/service-worker";
import {environment} from '../environments/environment';
import {ErrorPageComponent} from './error-page/error-page.component';
import {AppConfigService} from "./app-config.service";
import {HttpClientModule} from "@angular/common/http";
import {CampusComponent} from './campus/campus.component';
import {DeviceDetectorModule} from "ngx-device-detector";
import {SplashScreenComponent} from './splash-screen/splash-screen.component';
import {PwaStartComponent} from './pwa-start/pwa-start.component';
import {CampusListComponent} from './campus-list/campus-list.component';
import {SubscriptionButtonComponent} from './subscription-button/subscription-button.component';
import {WebBaseComponent} from './web-base/web-base.component';
import {DaysDisplayComponent} from './campus/days-display/days-display.component';
import {MenuDisplayComponent} from "./campus/menu-display/menu-display.component";


@NgModule({
  declarations: [
    AppComponent,
    DebugComponent,
    DefaultComponent,
    ErrorPageComponent,
    MenuDisplayComponent,
    CampusComponent,
    SplashScreenComponent,
    PwaStartComponent,
    CampusListComponent,
    SubscriptionButtonComponent,
    WebBaseComponent,
    DaysDisplayComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    DeviceDetectorModule.forRoot(),
  ],
  providers: [
    FacebookMessengerService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AppConfigService],
      useFactory: (configService: AppConfigService) => {
        return () => {
          return configService.loadAppConfig();
        }
      }
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
