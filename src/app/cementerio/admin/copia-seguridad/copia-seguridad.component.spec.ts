import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CopiaSeguridadComponent } from './copia-seguridad.component';

describe('CopiaSeguridadComponent', () => {
  let component: CopiaSeguridadComponent;
  let fixture: ComponentFixture<CopiaSeguridadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CopiaSeguridadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopiaSeguridadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
