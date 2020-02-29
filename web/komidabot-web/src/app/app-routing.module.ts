import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DebugComponent} from "./debug/debug.component";
import {DefaultComponent} from "./default/default.component";
import {BaseComponent} from "./base/base.component";
import {ErrorPageComponent} from "./error-page/error-page.component";
import {CampusComponent} from "./campus/campus.component";


const routes: Routes = [
  {path: '', component: DefaultComponent, pathMatch: 'full'},
  {path: 'base', component: BaseComponent},
  {path: 'debug', component: DebugComponent},
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
