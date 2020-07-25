import { TestBed } from '@angular/core/testing';

import { SectorService } from './sector.service';

describe('SectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SectorService = TestBed.get(SectorService);
    expect(service).toBeTruthy();
  });
});
