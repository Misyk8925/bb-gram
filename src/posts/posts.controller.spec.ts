import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

// Create a mock for PostsService
const mockPostsService = {
  createPost: jest.fn(),
  likePost: jest.fn(),
  getComments: jest.fn(),
  addComment: jest.fn(),
};

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: PostsService, useValue: mockPostsService },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  // Add more tests for your controller methods here
});