import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateQRCodeComponent } from './generate-qrcode.component';

describe('GenerateQrcodeComponent', () => {
  let component: GenerateQRCodeComponent;
  let fixture: ComponentFixture<GenerateQRCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenerateQRCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateQRCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
