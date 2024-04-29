import { Test, TestingModule } from '@nestjs/testing';
import { MapLogService } from './map-log.service';

describe('MapLogService', () => {
  let service: MapLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MapLogService],
    }).compile();

    service = module.get<MapLogService>(MapLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
