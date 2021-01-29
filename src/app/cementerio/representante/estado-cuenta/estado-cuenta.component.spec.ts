import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EstadoCuentaComponent } from './estado-cuenta.component';

describe('EstadoCuentaComponent', () => {
  let component: EstadoCuentaComponent;
  let fixture: ComponentFixture<EstadoCuentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EstadoCuentaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
