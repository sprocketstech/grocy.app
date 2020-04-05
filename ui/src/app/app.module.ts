import { BrowserModule, Title } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { 
  NbThemeModule, 
  NbLayoutModule,
  NbCardModule,
  NbSpinnerModule,
  NbButtonModule,
  NbIconModule,
  NbSidebarModule,
  NbSidebarService,
  NbAlertModule,
  NbInputModule,
  NbAccordionModule,
  NbListModule,
  NbDialogModule,
  NbSelectModule,
  NbMenuModule,
  NbToggleModule,
  NbCheckboxModule,
  NbActionsModule
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SetupComponent } from './pages/setup/setup.component';
import { StockComponent } from './pages/stock/stock.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { AddStockDialogComponent } from './components/add-stock-dialog/add-stock-dialog.component';
import { ConsumeStockDialogComponent } from './components/consume-stock-dialog/consume-stock-dialog.component';
import { ErrorInterceptor } from './error/error.interceptor';
import { ErrorComponent } from './pages/error/error.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ActionToolbarComponent } from './components/action-toolbar/action-toolbar.component';

@NgModule({
  declarations: [
    AppComponent, 
    SetupComponent,
    StockComponent,
    NotfoundComponent,
    AddStockDialogComponent,
    ConsumeStockDialogComponent,
    ErrorComponent,
    SettingsComponent,
    ActionToolbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NbThemeModule.forRoot({ name: 'cosmic' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbCardModule,
    NbSpinnerModule,
    NbButtonModule,
    NbIconModule,
    NbSidebarModule,
    NbAlertModule,
    NbInputModule,
    NbAccordionModule,
    NbListModule,
    NbDialogModule.forRoot(),
    NbSelectModule,
    NbMenuModule.forRoot(),
    NbToggleModule,
    NbCheckboxModule,
    NbActionsModule
  ],
  providers: [
    Title,
    NbSidebarService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
