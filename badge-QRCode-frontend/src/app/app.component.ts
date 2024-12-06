import { Component } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // per generare QRCode
/*   email: string = '';
  qrCodeUrl: string = '';

  generateQRCode() {
    const currentDateInSeconds = Math.floor(Date.now() / 1000);
    const dataToEncode = `${this.email}${currentDateInSeconds}`;

    QRCode.toDataURL(dataToEncode)
      .then(url => {
        this.qrCodeUrl = url;
      })
      .catch(err => {
        console.error(err);
      });
  } */
}
