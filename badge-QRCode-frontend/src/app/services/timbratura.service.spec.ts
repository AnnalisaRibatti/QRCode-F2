import { TestBed } from '@angular/core/testing';

import { TimbraturaService } from './timbratura.service';

describe('TimbraturaService', () => {
  let service: TimbraturaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimbraturaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
