import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DebugComponent} from "./debug/debug.component";
import {DefaultComponent} from "./default/default.component";
import {ErrorPageComponent} from "./error-page/error-page.component";
import {CampusComponent} from "./campus/campus.component";
import {PwaStartComponent} from "./pwa-start/pwa-start.component";
import {WebBaseComponent} from "./web-base/web-base.component";
import {ImageListComponent} from "./image-list/image-list.component";
import {SettingsComponent} from "./settings/settings.component";


const routes: Routes = [
  {path: '', component: DefaultComponent, pathMatch: 'full'},
  {path: 'pwa_start', component: PwaStartComponent, pathMatch: 'full'},
  {path: 'base', component: WebBaseComponent},
  {path: 'debug', component: DebugComponent},
  {path: 'images', component: ImageListComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'campus/:campus/d/:date', component: CampusComponent},
  {path: 'campus/:campus/w/:week', component: CampusComponent},
  {path: 'campus/:campus', component: CampusComponent},
  {path: '**', component: ErrorPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
