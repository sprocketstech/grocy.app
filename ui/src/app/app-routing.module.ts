import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SetupComponent } from './pages/setup/setup.component';
import { StockComponent } from './pages/stock/stock.component';
import { ErrorComponent } from './pages/error/error.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { SettingsComponent } from './pages/settings/settings.component';

import { SetupGuard } from './services/setup-guard.service';

const routes: Routes = [
  { 
    path: 'stock', 
    component: StockComponent, 
    data: {title: 'Stock'},
    canActivate: [SetupGuard]
  },
  { 
    path: 'settings', 
    component: SettingsComponent, 
    data: {title: 'Settings'},
    canActivate: [SetupGuard]
  },
  {
    path: 'error',
    component: ErrorComponent, 
    data: {title: 'Error'},
  },
  { path: 'setup', component: SetupComponent, data: {title: 'Setup'} },
  { path: '', redirectTo: '/stock', pathMatch: 'full' },
  { path: '**', component: NotfoundComponent, data: {title: 'Not Found'}  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
