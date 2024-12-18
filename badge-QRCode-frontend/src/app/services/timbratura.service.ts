import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Scan } from '../models/Scan';

import { ENVIRONMENT } from '../../environments/environment';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class TimbraturaService {
  private apiUrl = ENVIRONMENT.apiUrl + '/test/';

  constructor(private http: HttpClient) {}

  addScan(scannedData: Scan): Observable<any> {
    console.log('addScan', scannedData)
    console.log('this.apiUrl + infoQrCode', this.apiUrl + 'infoQrCode')
    return this.http.post(this.apiUrl + 'infoQrCode', scannedData); //  
    // è possibile specificare opzioni aggiuntive come intestazioni (headers) nel secondo argomento del metodo post
  };

  addStamping(userScan: User): Observable<any> {
/*
    {
      email: "a.bianchi@f2.it",
      nome: "Alberto",
      cognome: "Bianchi",
      ultima_timbratura: "entrata"
    }
*/
    //return this.http.post(this.apiUrl + 'savetimbroTestQrcode', userScan);

    return this.http.post(this.apiUrl + 'presenzeQR', userScan);
  };

  //capire se serve
  getScans(): Observable<Scan[]> {
    return this.http.get<Scan[]>(this.apiUrl + 'presenze');
  };
}
