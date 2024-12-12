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

  public buttonSelected: boolean = false;
  selectedButton: 'entrata' | 'uscita' | null = null; // Aggiungi questa variabile
  public actionType: 'entrata' | 'uscita' | null = null; // Variabile per tenere traccia del tipo di timbratura
  private configScan: any = { fps: ENVIRONMENT.framerPerSecond, qrbox: 430 }; // fotogrammi al secondo e dimensione del box di scansione in pixel.

  public scannedData?: Scan;
  private isScanningEnabled: boolean = true; // Stato per gestire la scansione
  private isScanning: boolean = false;

  //public listScannedData: Scan[] = Array<Scan>();

  //public userIsAdded: boolean = false;

  public dataTimbr?: string;
  public oraTimbr?: string;
  user?: User;



  constructor(
    private timbraturaService: TimbraturaService
  ) {}

  ngOnInit(): void {
    //this.getScans(); // Recupera gli scans all'avvio
  }

  ngAfterViewInit(): void {
    // attiva la scansione
    this.html5Qrcode = new Html5Qrcode("reader");
    //this.startScanning();
    //this.startCamera(); // Avvia la fotocamera all'avvio
  }

  ngOnDestroy(): void {
/*     this.html5Qrcode?.stop().catch(err => {
      console.error("Error stopping the QR code scanner", err);
    }); */
    this.stopScanning();
  };

  private startCamera(): void {
    console.log('startCamera')
    this.html5Qrcode?.start(
        { facingMode: "user" }, // Usa la fotocamera anteriore
        this.configScan,
        (decodedText: string, decodedResult: any) => {
            // Qui non fare nulla, poiché stai solo mostrando la fotocamera
        },
        (errorMessage: string) => {
            /* console.warn(`QR Code scan error: ${errorMessage}`);
                    // Controlla se l'errore è già stato visualizzato
            if (!this.errorDisplayed) {
              console.warn(`QR Code scan error: ${errorMessage}`);
              this.errorDisplayed = true; // Imposta l'indicatore che l'errore è già stato visualizzato
            } */
        }
    ).catch(err => {
        console.error("Error starting the QR code scanner", err);
    });
  };

  setTimbratura(action: 'entrata' | 'uscita') {
    console.log('setTimbratura')

    //this.stopScanning();

    this.actionType = action; // Imposta la variabile in base al pulsante cliccato
    this.buttonSelected = true;
    this.selectedButton = action; // Imposta il pulsante selezionato

    this.startScanning(); // Avviare lo scanner se necessario

    console.log(`Timbratura impostata a: ${this.actionType}`);
  };

  startScanning() {
    console.log('startScanning')
    this.isScanning = true; // Imposta lo stato di scansione a vero

    if (!this.isScanningEnabled) return; // Controlla se la scansione è abilitata
      this.user = undefined;
      this.errorDisplayed = false; // Resetta l'indicatore della visualizzazione dell'errore

      const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
        this.scannedData = {
          qrcodeToken : decodedText,
        }; // Salva il dato decodificato
        console.log(this.scannedData)

/*         // Rimuovi utenti scansionati obsoleti
        this.removeExpiredScans();

        // Aggiungi l'utente solo se non esiste già
        this.userIsAdded = this.addUserIfNotExists(this.listScannedData, this.scannedData);
 */

        /* if (this.userIsAdded) { */
          console.log('chiamata al be post addScan')
          this.timbraturaService.addScan(this.scannedData).subscribe({ // Chiamata al backend
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
              this.timbraturaService.addStamping(response).subscribe({ // Chiamata al backend
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
            },
            error: (err) => {
              console.error("Error adding scan", err);
            }
          })
        /* }; */

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

  private stopScanning(): void {
    if (this.isScanning) {
        this.html5Qrcode?.stop().then(() => {
            this.isScanning = false; // Imposta lo stato di scansione a falso dopo che è stata fermata
        }).catch(err => {
            console.error("Error stopping the QR code scanner", err);
        });
    }
  };

/*   private addUserIfNotExists(scans: Scan[], newScan: Scan): boolean {
    // Controlla se l'utente esiste già nella lista degli scan
    const userExists = scans.some(scan => scan.keyQRCode === newScan.keyQRCode);
    console.log('addUserIfNotExists', userExists);

    if (userExists) {
        return false; // L'utente esiste già, non aggiungere
    } else {
        scans.push(newScan); // Aggiungi il nuovo scan alla lista
        return true; // L'utente è stato aggiunto con successo
    }
  }; */

/*   private removeExpiredScans() {
    const currentTime = new Date().getTime();
    const expirationTime = ENVIRONMENT.timeToExpire * 1000; // 60 secondi in millisecondi

    this.listScannedData = this.listScannedData.filter(scan => {
      return (currentTime - scan.date) <= expirationTime; // Mantieni solo scans non scaduti
    });

    console.log('Updated listScannedData:', this.listScannedData);
  }; */

/*   private getScans() {
    console.log('getScans')
    this.timbraturaService.getScans().subscribe(scans => {
        this.listScannedData = scans.map(scan => ({
            keyQRCode: scan.keyQRCode,
            //date: new Date(scan.date).getTime()
            date: Math.floor(new Date(scan.date).getTime() / 1000) // Converte in secondi
        }));
        console.log('getScans', this.listScannedData)
    });
  }; */

}


