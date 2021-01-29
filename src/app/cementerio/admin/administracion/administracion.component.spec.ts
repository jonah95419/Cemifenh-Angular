import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdministracionComponent } from './administracion.component';

describe('AdministracionComponent', () => {
  let component: AdministracionComponent;
  let fixture: ComponentFixture<AdministracionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministracionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
