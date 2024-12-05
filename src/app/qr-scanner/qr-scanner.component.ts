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
        
      // Aggiungi l'utente solo se non esiste già
      this.userIsAdded = this.addUserIfNotExists(this.listScannedData, this.scannedData);

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

    
    // veridico a db se utente ha già badge-ato
    //....
    // if( scannedData presente a db ) {
    //  .... this.scannedData = undefined;
    //  stringRes = 'già fatto badge'
    // }
  };

  addUserIfNotExists(scans: Scan[], newScan: Scan): boolean {
    // Controlla se l'utente esiste già nella lista degli scan
    const userExists = scans.some(scan => scan.user === newScan.user);
    console.log('addUserIfNotExists', userExists);
    
    if (userExists) {
        return false; // L'utente esiste già, non aggiungere
    } else {
        scans.push(newScan); // Aggiungi il nuovo scan alla lista
        console.log(scans);
        console.log(this.listScannedData);
        return true; // L'utente è stato aggiunto con successo
    }
  };

}

interface Scan {
  user: string;
  date: number;
}