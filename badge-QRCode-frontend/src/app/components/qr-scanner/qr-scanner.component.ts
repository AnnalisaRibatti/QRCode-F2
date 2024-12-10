import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { ENVIRONMENT } from '../../../environments/environment';

import { Scan } from '../../models/Scan';
import { TimbraturaService } from './../../services/timbratura.service';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnInit, OnDestroy, AfterViewInit {
  private html5Qrcode?: Html5Qrcode;
  private errorDisplayed: boolean = false; // Stato per gestire la visualizzazione dell'errore

  public scannedData?: Scan;
  private isScanningEnabled: boolean = true; // Stato per gestire la scansione

  public listScannedData: Scan[] = Array<Scan>();

  public userIsAdded: boolean = false;


  constructor(
    private timbraturaService: TimbraturaService
  ) {}

  ngOnInit(): void {
    this.getScans(); // Recupera gli scans all'avvio
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
    if (!this.isScanningEnabled) return; // Controlla se la scansione è abilitata

      this.errorDisplayed = false; // Resetta l'indicatore della visualizzazione dell'errore

      const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
        this.scannedData = {
          user: decodedText,
          //date: new Date().getTime()
          date: Math.floor(Date.now() / 1000) // Converte il timestamp in secondi
        }; // Salva il dato decodificato
        console.log(this.scannedData)

        // Rimuovi utenti scansionati obsoleti
        this.removeExpiredScans();

        // Aggiungi l'utente solo se non esiste già
        this.userIsAdded = this.addUserIfNotExists(this.listScannedData, this.scannedData);

        if (this.userIsAdded) {
          this.timbraturaService.addScan(this.scannedData).subscribe({ // Chiamata al backend
            next: (response) => {
              console.log(response);

              this.isScanningEnabled = false; // Disabilita la scansione
              setTimeout(() => {
                this.isScanningEnabled = true; // Riabilita la scansione dopo 10 secondi
              }, 10000); // 10 secondi
            },
            error: (err) => {
              console.error("Error adding scan", err);
            }
          })
        };

  /*    // chiude la fotocamera dopo l'uso
          this.html5Qrcode?.stop().catch(err => {
          console.error("Error stopping the QR code scanner", err);
        });  */
      };

      const qrCodeErrorCallback = (errorMessage: string) => {
        // Controlla se l'errore è già stato visualizzato
        if (!this.errorDisplayed) {
            console.warn(`QR Code scan error: ${errorMessage}`);
            this.errorDisplayed = true; // Imposta l'indicatore che l'errore è già stato visualizzato
        }
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
  };

  private addUserIfNotExists(scans: Scan[], newScan: Scan): boolean {
    // Controlla se l'utente esiste già nella lista degli scan
    const userExists = scans.some(scan => scan.user === newScan.user);
    console.log('addUserIfNotExists', userExists);

    if (userExists) {
        return false; // L'utente esiste già, non aggiungere
    } else {
        scans.push(newScan); // Aggiungi il nuovo scan alla lista
        return true; // L'utente è stato aggiunto con successo
    }
  };

  private removeExpiredScans() {
    const currentTime = new Date().getTime();
    const expirationTime = ENVIRONMENT.timeToExpire * 1000; // 60 secondi in millisecondi

    this.listScannedData = this.listScannedData.filter(scan => {
      return (currentTime - scan.date) <= expirationTime; // Mantieni solo scans non scaduti
    });

    console.log('Updated listScannedData:', this.listScannedData);
  };

  private getScans() {
    this.timbraturaService.getScans().subscribe(scans => {
        this.listScannedData = scans.map(scan => ({
            user: scan.user,
            //date: new Date(scan.date).getTime()
            date: Math.floor(new Date(scan.date).getTime() / 1000) // Converte in secondi
        }));
    });
  };

}


