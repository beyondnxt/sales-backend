import { Test, TestingModule } from '@nestjs/testing';
import { IteamController } from './iteam.controller';

describe('IteamController', () => {
  let controller: IteamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IteamController],
    }).compile();

    controller = module.get<IteamController>(IteamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
