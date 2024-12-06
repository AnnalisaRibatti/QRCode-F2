import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Scan } from '../models/Scan';

import { ENVIRONMENT } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimbraturaService {
  private apiUrl = ENVIRONMENT.apiUrl + '/api/';

  constructor(private http: HttpClient) {}

  addScan(scan: Scan): Observable<any> {
    return this.http.post(this.apiUrl + 'scan', { user: scan.user });
  }

  getScans(): Observable<Scan[]> {
    return this.http.get<Scan[]>(this.apiUrl + 'scans');
  }
}
