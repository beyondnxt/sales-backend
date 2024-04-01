import { Test, TestingModule } from '@nestjs/testing';
import { AttendenceController } from './attendance.controller';

describe('AttendenceController', () => {
  let controller: AttendenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendenceController],
    }).compile();

    controller = module.get<AttendenceController>(AttendenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
