import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnInit, OnDestroy, AfterViewInit {
  private html5Qrcode?: Html5Qrcode;
  public scannedData?: Scan;

    listScannedData: Scan[] = Array<Scan>(); 

  public userIsAdded: boolean = false;

  constructor() {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.html5Qrcode = new Html5Qrcode("reader");
    this.startScanning();
  }

  ngOnDestroy(): void {
    this.html5Qrcode?.stop().catch(err => {
      console.error("Error stopping the QR code scanner", err);
    });
  };

  startScanning() {
    const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
      this.scannedData = {
        user: decodedText,
        date: new Date().getTime()
    }; // Salva il dato decodificato
      
      /*    // chiude la fotocamera dopo l'uso
        this.html5Qrcode?.stop().catch(err => {
        console.error("Error stopping the QR code scanner", err);
      }); */
    };

    const qrCodeErrorCallback = (errorMessage: string) => {
      console.warn(`QR Code scan error: ${errorMessage}`);
    };

    const config = { fps: 10, qrbox: 430 }; // 10 fotogrammi al secondo e una dimensione del box di scansione di 250 pixel.

    this.html5Qrcode?.start(
      //{ facingMode: "environment" }, // Usa la fotocamera posteriore se disponibile
      { facingMode: "user" }, // Usa la fotocamera anteriore
      config,
      qrCodeSuccessCallback,
      qrCodeErrorCallback
    ).catch(err => {
      console.error("Error starting the QR code scanner", err);
    });

    console.log('addUserIfNotExists')

    this.userIsAdded = this.addUserIfNotExists(this.listScannedData, this.scannedData!);
    
    // veridico a db se utente ha già badge-ato
    //....
    // if( scannedData presente a db ) {
    //  .... this.scannedData = undefined;
    //  stringRes = 'già fatto badge'
    // }
  };

  addUserIfNotExists(scans: Scan[], newScan: Scan): boolean {
    const userExists = scans.some(scan => newScan.user === newScan.user);
    console.log('addUserIfNotExists', userExists)
    /* if (userExists) {
        return false;
    } else {
      scans.push(newScan);
      console.log(scans)
      console.log(this.listScannedData)
      return true;
    } */
      return false;
}


}

interface Scan {
  user: string;
  date: number;
}