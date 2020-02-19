import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {FacebookMessengerService} from './facebook-messenger.service';
import {DebugComponent} from "./debug/debug.component";
import {AppComponent} from "./app.component";
import {DefaultComponent} from './default/default.component';
import {ServiceWorkerModule} from "@angular/service-worker";
import {environment} from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent,
    DebugComponent,
    DefaultComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production})
  ],
  providers: [
    FacebookMessengerService,
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
