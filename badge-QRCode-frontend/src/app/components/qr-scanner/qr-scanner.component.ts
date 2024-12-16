import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { ENVIRONMENT } from '../../../environments/environment';

import { Scan } from '../../models/Scan';
import { TimbraturaService } from './../../services/timbratura.service';
import { User } from '../../models/User';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnInit, OnDestroy, AfterViewInit {
  private html5Qrcode?: Html5Qrcode;
  private errorDisplayed: boolean = false; // Stato per gestire la visualizzazione dell'errore

  buttonSelected: boolean = false;
  selectedButton: 'entrata' | 'uscita' | null = null; // Aggiungi questa variabile
  actionType: 'entrata' | 'uscita' | null = null; // Variabile per tenere traccia del tipo di timbratura

  private configScan: any = { fps: ENVIRONMENT.framerPerSecond, qrbox: 430 }; // fotogrammi al secondo e dimensione del box di scansione in pixel.

  scannedData?: Scan;

  private isScanningEnabled: boolean = true; // Stato per gestire la scansione
  private isScanning: boolean = false;
  private scannerTimeout: any; // per gestire il timeout della scansione.
  private inactivityTimeout: any; // Timeout per inattività


  dataTimbr?: string;
  oraTimbr?: string;
  user?: User;


  constructor(
    private timbraturaService: TimbraturaService
  ) {}

  ngOnInit(): void {};

  ngAfterViewInit(): void {
    // attiva la scansione
    this.html5Qrcode = new Html5Qrcode("reader");
  };

  ngOnDestroy(): void {
    this.stopScanning();

    clearTimeout(this.inactivityTimeout); // Pulisci il timeout di inattività
  };

  setTimbratura(action: 'entrata' | 'uscita'): void {
    console.log('setTimbratura')

    this.actionType = action; // Imposta la variabile in base al pulsante cliccato
    this.buttonSelected = true;
    this.selectedButton = action; // Imposta il pulsante selezionato

    console.log(`Timbratura impostata a: ${this.actionType}`);

    // Cancella il timeout se esiste
    if (this.scannerTimeout) {
      clearTimeout(this.scannerTimeout);
    }

    // Inizia il timeout di inattività
    this.startInactivityTimeout();

    // Avvia la scansione solo se non è già in corso
    if (!this.isScanning) {
      this.startScanning(); // Avviare lo scanner se non è già in corso
    } else {
      // Qui, se la scansione è già in corso, potresti voler anche resettare il timeout di inattività
      this.resetInactivityTimeout();
      //this.resetScanner();
    }

    // Se la scansione è in standby, riabilitala
    if (!this.isScanningEnabled) {
      this.isScanningEnabled = true; // Riabilita la scansione
      this.startScanning(); // Avvia di nuovo la scansione
    }
  };

  startScanning(): void {
    console.log('startScanning')

    if (!this.isScanningEnabled) return; // Controlla se la scansione è abilitata

      this.isScanning = true; // Imposta lo stato di scansione a vero
      this.user = undefined;
      this.errorDisplayed = false; // Resetta l'indicatore della visualizzazione dell'errore

      const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
        this.scannedData = {
          qrcodeToken : decodedText,
        }; // Salva il dato decodificato
        console.log(this.scannedData)

        console.log('chiamata al be post addScan')
        this.addScan();

        this.resetInactivityTimeout(); // Resetta il timeout di inattività
      };

      const qrCodeErrorCallback = (errorMessage: string) => {
        // Controlla se l'errore è già stato visualizzato
        if (!this.errorDisplayed) {
            console.warn(`QR Code scan error: ${errorMessage}`);
            this.errorDisplayed = true; // Imposta l'indicatore che l'errore è già stato visualizzato
        }
      };

      // Qui avvii la scansione quando un bottone è selezionato
      if (this.buttonSelected) {
        this.html5Qrcode?.start(
          //{ facingMode: "environment" }, // Usa la fotocamera posteriore se disponibile
          { facingMode: "user" }, // Usa la fotocamera anteriore
          this.configScan,
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        ).catch(err => {
          console.error("Error starting the QR code scanner", err);
        });
      }

      console.log('addUserIfNotExists')
  };

  private addScan(): void {
    this.timbraturaService.addScan(this.scannedData!).subscribe({
      next: (response) => {
        const body = JSON.parse(response.body);
        this.user = body[0];

        if(this.user){
          this.user.ultima_timbratura = this.actionType as string,

          this.isScanningEnabled = false;


          // Procedi con la timbratura
          this.processTimbratura();

  /*         this.timbraturaService.addStamping(this.user).subscribe({
            next: (response) => {
              const body = JSON.parse(response.body);
              this.dataTimbr = body.item.data_timbratura;
              this.oraTimbr = body.item.ora_timbratura;
              this.startInactivityTimeout(); // Inizia il timeout di inattività
            },
            error: (err) => {
              console.error("Error adding stamping", err);
            }
          }); */    
        }
      },
      error: (err) => {
        console.error("Error adding scan", err);
      }
    });
  }

  private resetScanner(): void {
    console.log('resetScanner')
    this.scannedData = undefined;
    this.user = undefined;
  }

  private startInactivityTimeout(): void {
    console.log('startInactivityTimeout')
    this.inactivityTimeout = setTimeout(() => {
      this.scannerStandby();
    }, ENVIRONMENT.msScanningEnabled);
  }

  private resetInactivityTimeout(): void {
    console.log('resetInactivityTimeout')
    clearTimeout(this.inactivityTimeout);
    this.startInactivityTimeout();
  }

  private scannerStandby(): void {
    console.log('scannerStandby')
    this.resetScanner();

    this.buttonSelected = false;
    this.selectedButton = null; // Imposta il pulsante selezionato

    this.isScanningEnabled = false; // Controlla se la scansione è abilitata

    this.stopScanning();
  }

  private stopScanning(): void {
    if (this.isScanning) {
      this.html5Qrcode?.stop().then(() => {
        this.isScanning = false; // Imposta lo stato di scansione a falso dopo che è stata fermata
      }).catch(err => {
        console.error("Error stopping the QR code scanner", err);
      });
    }
  };

  private processTimbratura(): void {
    console.log('chiamata al be post addStamping');
    this.timbraturaService.addStamping(this.user).subscribe({
      next: (response) => {
        const body = JSON.parse(response.body);
        this.dataTimbr = body.item.data_timbratura;
        this.oraTimbr = body.item.ora_timbratura;
        // Qui, puoi anche inserire un timeout per riabilitare la scansione se necessario

/*         this.listScannedData = scans.map(scan => ({
          user: scan.user,
          //date: new Date(scan.date).getTime()
          date: Math.floor(new Date(scan.date).getTime() / 1000) // Converte in secondi
        })); */
      },
      error: (err) => {
        console.error("Error adding stamping", err);
      }
    });
  };


/*   private scannerStandbyOLD(): void {
    console.log('scannerStandby')
    setTimeout(() => {
      this.actionType = null; // Imposta la variabile in base al pulsante cliccato

      this.buttonSelected = false;
      this.selectedButton = null; // Imposta il pulsante selezionato

      this.isScanningEnabled = false; // Controlla se la scansione è abilitata

      this.user = undefined;
      this.errorDisplayed = false; // Resetta l'indicatore della visualizzazione dell'errore
      this.scannedData = undefined;

      this. stopScanning();

    }, ENVIRONMENT.msScanningStanby);
  }; */

  fun() {
    this.timbraturaService.addScan(this.scannedData!).subscribe({ // Chiamata al backend
      next: (response) => {
        console.log('response', response);
        console.log('response.body', response.body);
        const body = JSON.parse(response.body);
        console.log('body', body);
        /*         {
          "nome":"",
          "cognome":"",
          "email":""
          } */
          this.user = body[0];
          console.log('user', this.user);

        this.isScanningEnabled = false; // Disabilita la scansione

        // chiamo altro endpoint timbrature
        console.log('chiamata al be post addStamping')
        this.timbraturaService.addStamping(this.user).subscribe({ // Chiamata al backend
          next: (response) => {
            console.log('response', response);
            console.log('response.body', response.body);
            /*
            {
              message: "Timbratura effettuata con successo",
              item:{
                email: "mario.rossi@example.com",
                nome_cognome: "Mario Rossi",
                id_timbratura: "JISDHU-SFFS-SFGSSF-SFSF",
                ultima_timbratura: "E",
                data_timbratura: "11/12/2024",
                ora_timbratura: "15:20:34"
              }
            }
            */

            const body = JSON.parse(response.body);

            this.dataTimbr = body.item.data_timbratura;
            this.oraTimbr =  body.item.ora_timbratura;
          },
          error: (err) => {
            console.error("Error adding scan", err);
          }
        })

        setTimeout(() => {
          this.isScanningEnabled = true; // Riabilita la scansione dopo 10 secondi
        }, ENVIRONMENT.msScanningEnabled); // 10 secondi

        this.scannerStandby();
      },
      error: (err) => {
        console.error("Error adding scan", err);
      }
    });

/*    // chiude la fotocamera dopo l'uso
      this.html5Qrcode?.stop().catch(err => {
      console.error("Error stopping the QR code scanner", err);
    });  */

    // Imposta un timeout per mettere in standby la fotocamera
    this.scannerTimeout = setTimeout(() => {
      this.scannerStandby();
    }, ENVIRONMENT.msScanningStanby);
  }
}


