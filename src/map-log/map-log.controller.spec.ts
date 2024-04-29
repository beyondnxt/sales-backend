import { Test, TestingModule } from '@nestjs/testing';
import { MapLogController } from './map-log.controller';

describe('MapLogController', () => {
  let controller: MapLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapLogController],
    }).compile();

    controller = module.get<MapLogController>(MapLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
