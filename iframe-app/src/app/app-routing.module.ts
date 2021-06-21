import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IframecontentComponent } from './iframecontent/iframecontent.component';

const routes: Routes = [
  { path: '', component: IframecontentComponent },
  { path: 'operation', component: IframecontentComponent },
  { path: 'operation/:id', component: IframecontentComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
