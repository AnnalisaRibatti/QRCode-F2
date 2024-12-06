import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QrScannerComponent } from './components/qr-scanner/qr-scanner.component';
import { GenerateQRCodeComponent } from './components/generate-qrcode/generate-qrcode.component';
import { ResultsComponent } from './components/results/results.component';

const routes: Routes = [
  { path: 'scan', component: QrScannerComponent },
  { path: 'generate', component: GenerateQRCodeComponent },
  { path: 'results', component: ResultsComponent },
  { path: '', redirectTo: '/scan', pathMatch: 'full' }, // Redirect to the scan page by default
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
