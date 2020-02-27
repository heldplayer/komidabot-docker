import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {FacebookMessengerService} from './facebook-messenger.service';
import {DebugComponent} from "./debug/debug.component";
import {AppComponent} from "./app.component";
import {DefaultComponent} from './default/default.component';
import {ServiceWorkerModule} from "@angular/service-worker";
import {environment} from '../environments/environment';
import {BaseComponent} from './base/base.component';
import {ErrorPageComponent} from './error-page/error-page.component';
import {AppConfigService} from "./app-config.service";
import {HttpClientModule} from "@angular/common/http";


@NgModule({
  declarations: [
    AppComponent,
    DebugComponent,
    DefaultComponent,
    BaseComponent,
    ErrorPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production})
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
