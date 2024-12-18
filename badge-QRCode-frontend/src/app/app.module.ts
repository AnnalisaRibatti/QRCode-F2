import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { QrScannerComponent } from './components/qr-scanner/qr-scanner.component';

import { DATE_PIPE_DEFAULT_OPTIONS } from "@angular/common";
import { HttpClientModule } from '@angular/common/http';
import { GenerateQRCodeComponent } from './components/generate-qrcode/generate-qrcode.component';
import { ResultsComponent } from './components/results/results.component';
import { CapitalizePipe } from './pipe/capitalize.pipe';


@NgModule({
  declarations: [
    AppComponent,
    QrScannerComponent,
    GenerateQRCodeComponent,
    ResultsComponent,
    CapitalizePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
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
