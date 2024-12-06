import { Component, OnInit } from '@angular/core';
import { TimbraturaService } from './../../services/timbratura.service';
import { Scan } from '../../models/Scan';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  public listScannedData: Scan[] = [];

  constructor(private timbraturaService: TimbraturaService) {}

  ngOnInit(): void {
    this.getScans();
  }

  private getScans() {
    this.timbraturaService.getScans().subscribe(scans => {
      this.listScannedData = scans;
      console.log(this.listScannedData)
    });
  }

}
