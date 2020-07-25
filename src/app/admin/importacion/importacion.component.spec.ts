import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportacionComponent } from './importacion.component';

describe('ImportacionComponent', () => {
  let component: ImportacionComponent;
  let fixture: ComponentFixture<ImportacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
