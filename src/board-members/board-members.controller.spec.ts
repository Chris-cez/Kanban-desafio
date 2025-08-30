import { Test, TestingModule } from '@nestjs/testing';
import { BoardMembersController } from './board-members.controller';

describe('BoardMembersController', () => {
  let controller: BoardMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardMembersController],
    }).compile();

    controller = module.get<BoardMembersController>(BoardMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
