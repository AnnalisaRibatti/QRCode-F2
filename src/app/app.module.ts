import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';

import { DATE_PIPE_DEFAULT_OPTIONS } from "@angular/common";


@NgModule({
  declarations: [
    AppComponent,
    QrScannerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: "short" }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
