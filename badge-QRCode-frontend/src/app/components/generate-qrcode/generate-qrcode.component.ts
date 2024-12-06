import { Component } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'app-generate-qrcode',
  templateUrl: './generate-qrcode.component.html',
  styleUrls: ['./generate-qrcode.component.css']
})
export class GenerateQRCodeComponent {
  email: string = '';
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
  }
}
