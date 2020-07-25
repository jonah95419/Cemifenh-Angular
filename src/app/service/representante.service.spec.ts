import { TestBed } from '@angular/core/testing';

import { RepresentanteService } from './representante.service';

describe('RepresentanteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RepresentanteService = TestBed.get(RepresentanteService);
    expect(service).toBeTruthy();
  });
});
