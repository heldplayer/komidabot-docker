import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DebugComponent} from "./debug/debug.component";
import {DefaultComponent} from "./default/default.component";


const routes: Routes = [
  {path: '', component: DefaultComponent, pathMatch: 'full'},
  {path: 'debug', component: DebugComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
