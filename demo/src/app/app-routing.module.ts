import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tes1Component } from './components/tes1/tes1.component';

const routes: Routes = [
  { path: '', redirectTo: '/de', pathMatch: 'full' },
  {
    path: 'en', children: [
      { path: 'test1', component: Tes1Component, pathMatch: 'full' },
      { path: 'not-found', component: Tes1Component, pathMatch: 'full' }
    ]
  },
  {
    path: 'de', children: [
      { path: 'test1', component: Tes1Component, pathMatch: 'full' },
      { path: 'not-found', component: Tes1Component, pathMatch: 'full' }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
