import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Scan } from '../models/Scan';

import { ENVIRONMENT } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimbraturaService {
  private apiUrl = ENVIRONMENT.apiUrl + '/test/';

  constructor(private http: HttpClient) {}

  addScan(scan: Scan): Observable<any> {
    console.log('addScan', scan)
    console.log('this.apiUrl + infoQrCode', this.apiUrl + 'infoQrCode')
    return this.http.post(this.apiUrl + 'infoQrCode', scan); //  
    // è possibile specificare opzioni aggiuntive come intestazioni (headers) nel secondo argomento del metodo post
  }

  addStamping(userScan: any): Observable<any> {
/*
    user {
      email: "a.bianchi@f2.it",
      nome_cognome: "Alberto Bianchi",
      id_timbratura: "JISDHU-SFFS-SFGSSF-SFSF",
      Ultima_timbratura: "E"
    }
*/

/*     // Divisione della stringa in un array
    let [nome, cognome] = userScan.nome_cognome.split(" ");

    let userStamp = {
        nome: nome,
        cognome: cognome,
        indirizzo: userScan.email
    }; */

    return this.http.post(this.apiUrl + 'savetimbroTestQrcode', userScan); //  se passo la data
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
  }

  getScans(): Observable<Scan[]> {
    return this.http.get<Scan[]>(this.apiUrl + 'scans');
  }
}
