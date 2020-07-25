import { TestBed } from '@angular/core/testing';

import { FallecidoService } from './fallecido.service';

describe('FallecidoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FallecidoService = TestBed.get(FallecidoService);
    expect(service).toBeTruthy();
  });
});
