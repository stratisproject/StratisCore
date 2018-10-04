import { TestBed, inject } from '@angular/core/testing';

import { StakingService } from './staking.service';

describe('StakingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StakingService]
    });
  });

  it('should be created', inject([StakingService], (service: StakingService) => {
    expect(service).toBeTruthy();
  }));
});
