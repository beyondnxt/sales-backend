import { Test, TestingModule } from '@nestjs/testing';
import { IteamService } from './iteam.service';

describe('IteamService', () => {
  let service: IteamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IteamService],
    }).compile();

    service = module.get<IteamService>(IteamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
