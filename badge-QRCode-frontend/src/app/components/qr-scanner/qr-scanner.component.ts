import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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

  buttonSelected = false;
  selectedButton: 'entrata' | 'uscita' | 'pausa' | null = null; // Aggiungi questa variabile
  private actionType: 'entrata' | 'uscita' | 'pausa' | null = null; // Variabile per tenere traccia del tipo di timbratura

  private configScan = { fps: ENVIRONMENT.framerPerSecond, qrbox: 430 }; // fotogrammi al secondo e dimensione del box di scansione in pixel.

  scannedData?: Scan;

  private isScanningEnabled: boolean = true; // Stato per gestire la scansione
  private isScanning: boolean = false;
  private scannerTimeout: any; // per gestire il timeout della scansione.
  private inactivityTimeout: any; // Timeout per inattività

  user?: User;

  //entrataUscita?: string;
  message?: string;

  private listScannedData: Scan[] = Array<Scan>();


  constructor(
    private timbraturaService: TimbraturaService
  ) {}

  ngOnInit(): void {};

  ngAfterViewInit(): void {
    // attiva la scansione
    this.html5Qrcode = new Html5Qrcode("reader");

    const isSmallScreen = window.innerWidth <= 1280;
    //const isSmallScreen = window.innerHeight <= 600;
    console.log('window.innerWidth', window.innerWidth)
    console.log('window.innerHeight', window.innerHeight)
    console.log('isSmallScreen', isSmallScreen)
    this.configScan.qrbox = isSmallScreen ? 310 : 400;
  };

  ngOnDestroy(): void {
    this.stopScanning();

    clearTimeout(this.inactivityTimeout); // Pulisci il timeout di inattività
  };

  setTimbratura(action: 'entrata' | 'uscita' | 'pausa'): void {
    this.actionType = action; // Imposta la variabile in base al pulsante cliccato
    this.buttonSelected = true;
    this.selectedButton = action; // Imposta il pulsante selezionato

    this.message = undefined;

    // Cancella il timeout se esiste
    if (this.scannerTimeout) {
      clearTimeout(this.scannerTimeout);
    }

    // Inizia il timeout di inattività
    this.startInactivityTimeout();

    console.log('setTimbratura -> this.isScanning', this.isScanning)
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
    
    this.removeExpiredScans(); // Rimuove gli scans scaduti
  };

  startScanning(): void {
    console.log('startScanning -> resetto variabili')
    if (!this.isScanningEnabled) return; // Controlla se la scansione è abilitata

      this.isScanning = true; // Imposta lo stato di scansione a vero
      this.user = undefined;
      this.errorDisplayed = false; // Resetta l'indicatore della visualizzazione dell'errore

      const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => { 
        // Disabilita la scansione
        this.isScanningEnabled = false;

        this.message = undefined;

        console.log('startScanning qrCodeSuccessCallback -> decodedText', decodedText)
        console.log('startScanning qrCodeSuccessCallback -> !this.isScanningEnabled', !this.isScanningEnabled)
        //if (!this.isScanningEnabled) return; // Controlla di nuovo se la scansione è abilitata
        console.log('DOPO startScanning qrCodeSuccessCallback -> !this.isScanningEnabled  -> decodedText', decodedText)
        
        this.scannedData = { 
          qrcodeToken : decodedText,
        }; // Salva il dato decodificato
        console.log('startScanning qrCodeSuccessCallback -> this.scannedData', this.scannedData)
        
        console.log('startScanning qrCodeSuccessCallback -> this.listScannedData', this.listScannedData)
        //this.addUserIfNotExists(); // Controlla se l'utente esiste già nella lista degli scan
        // Controlla se l'utente esiste già nella lista degli scan
        const userExists = this.listScannedData.some(scan => scan.qrcodeToken === this.scannedData!.qrcodeToken);
        if (userExists) {
          console.log('startScanning qrCodeSuccessCallback -> addUserIfNotExists', userExists, 'non proseguo');
          this.message = 'Timbratura già registrata.';
          return; // L'utente esiste già, non proseguire
        };
        console.log('startScanning qrCodeSuccessCallback -> addUserIfNotExists', userExists, 'proseguo');

        this.addScan();

        this.resetInactivityTimeout(); // Resetta il timeout di inattività
      };

      const qrCodeErrorCallback = (errorMessage: string) => {
        // Controlla se l'errore è già stato visualizzato
        if (!this.errorDisplayed) {
            console.warn(`QR Code scan error: ${errorMessage}`);
            this.errorDisplayed = true; // Imposta l'indicatore che l'errore è già stato visualizzato
            this.message = `QR Code scan error: ${errorMessage}`;
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
        ).then(() => {
          // Applica dopo che il video è stato avviato
        }).catch(err => {
          console.error("Error starting the QR code scanner", err);
          this.message = err;
        });
      }

      console.log('startScanning qrCodeErrorCallback ->addUserIfNotExists')
  };

  private addScan(): void {
    this.timbraturaService.addScan(this.scannedData!).subscribe({
      next: (response) => {
        const body = JSON.parse(response.body);
        if(body.length == 0) {
          this.user = {};
          this.message = 'QRCode non riconosciuto!';
          return;
        }
        this.user = body[0];

        if(this.user){
          this.user.ultimaTimbratura = this.actionType as string;
          this.scannedData!.nome = this.user.nome; // eliminare

          // Disabilitare la scansione per un certo tempo prima di riabilitarla
          setTimeout(() => {
            this.isScanningEnabled = true; // Riabilita la scansione dopo ENVIRONMENT.msScanningEnabled
          }, ENVIRONMENT.msScanningEnabled); // msScanningEnabled è il tempo in millisecondi

          // Procedi con la timbratura
          this.processTimbratura();  
        }
      },
      error: (err) => {
        console.error("Error adding scan", err);
        this.message = err;
      }
    });
  }

  private resetScanner(): void {
    this.scannedData = undefined;
    this.user = undefined;

    this.message = undefined;
  }

  private startInactivityTimeout(): void {
    this.inactivityTimeout = setTimeout(() => {
      this.scannerStandby();
    }, ENVIRONMENT.msScanningEnabled);
  }

  private resetInactivityTimeout(): void {
    clearTimeout(this.inactivityTimeout);
    this.startInactivityTimeout();
  }

  private scannerStandby(): void {
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
        this.message = err;
      });
    }
  };

  private processTimbratura(): void {
    this.timbraturaService.addStamping(this.user!).subscribe({
      next: (response) => {
        const body = JSON.parse(response.body);

        if(response.statusCode == '200') {
          let userStamping;

          if(body.newPresenza) {
            userStamping = body.newPresenza
          } else if(body.items && body.items.length > 0) {
            userStamping = body.items[0]
          }

          this.scannedData!.data = userStamping.data.S;
          let countTimbri = userStamping.countTimbri.N;
          
          console.log('processTimbratura -> countTimbri', countTimbri, (countTimbri-1));
          
          this.scannedData!.ora = userStamping['ora'+countTimbri].S;
          
          this.scannedData!.entrataUscita = countTimbri % 2 === 0 ? 'uscita' : 'entrata';

          console.log('processTimbratura -> this.scannedData', this.scannedData)
          this.listScannedData.push(this.scannedData!);
          //this.addUserIfNotExists(this.scannedData!)
          console.log('processTimbratura -> this.listScannedData', this.listScannedData)
        }
        
        if(this.user?.ultimaTimbratura != this.scannedData!.entrataUscita ) {
          this.message = 'La selezione del tipo timbratura e le timbrature registrate non corrispondono!';
        }
        // Qui, puoi anche inserire un timeout per riabilitare la scansione se necessario
      },
      error: (err) => {
        console.error("Error adding stamping", err);
        this.message = err;
      }
    });
  };

/*   private addUserIfNotExists(newScan: Scan): boolean {
    // Controlla se l'utente esiste già nella lista degli scan
    const userExists = this.listScannedData.some(scan => scan.qrcodeToken === newScan.qrcodeToken);
    console.log('addUserIfNotExists', userExists);

    if (userExists) {
        return false; // L'utente esiste già, non aggiungere
    } else {
        this.listScannedData.push(newScan); // Aggiungi il nuovo scan alla lista
        return true; // L'utente è stato aggiunto con successo
    }
  }; */

  addUserIfNotExists() {
    // Controlla se l'utente esiste già nella lista degli scan
    const userExists = this.listScannedData.some(scan => scan.qrcodeToken === this.scannedData!.qrcodeToken);
    if (userExists) {
      console.log('addUserIfNotExists', userExists, 'non proseguo');
      return; // L'utente esiste già, non proseguire
    };
    console.log('addUserIfNotExists', userExists, 'proseguo');
  };

  private removeExpiredScans() {
    console.log('removeExpiredScans')
    const currentTime = new Date().getTime();
    const expirationTime = ENVIRONMENT.timeToExpire * 1000; // 60 secondi in millisecondi
    
    console.log('@@@@@ removeExpiredScans', this.listScannedData)
    this.listScannedData = this.listScannedData.filter(scan => 
      {
        console.log('scan', scan)
        // Combina le stringhe in un formato che JavaScript può interpretare
        // Nota: il formato deve essere YYYY-MM-DDTHH:mm:ss per essere compatibile
        const combinedString =  scan.data!.split('/').reverse().join('-') + 'T' +  scan.ora;
        
        // Crea un oggetto Date
        const date = new Date(combinedString);
        console.log('combinedString', combinedString);
        console.log('date', date);
        
        // Ottieni il timestamp in millisecondi
        const milliseconds = date.getTime();
        
        console.log('currentTime', currentTime);
        console.log('milliseconds', milliseconds);
        console.log('expirationTime', expirationTime);
        console.log('(currentTime - milliseconds) <= expirationTime', (currentTime - milliseconds) <= expirationTime);
        
        return (currentTime - milliseconds) <= expirationTime; // Mantieni solo scans non scaduti
      });
      console.log('@@@@@ removeExpiredScans', this.listScannedData)

    console.log('Updated listScannedData:', this.listScannedData);
  }; 

}