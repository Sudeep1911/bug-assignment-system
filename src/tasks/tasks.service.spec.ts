import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TaskService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './tasks.schema';
import { KanbanStage } from 'src/kanbanStages/kanbanStages.schema';
import { GPTService } from 'src/gpt/gpt.sevice';

// Mock data
const mockTask = {
  _id: 'task-123',
  taskId: 'TASK-001',
  projectId: 'project-456',
  description: 'Test task',
  status: 'stage-123',
  priority: 'High',
  assignedTo: 'user-789',
};

const mockKanbanStages = [
  { _id: 'stage-123', name: 'In Progress', projectId: 'project-456' },
  { _id: 'stage-456', name: 'Testing', projectId: 'project-456' },
];

const mockGptResponse = {
  priority: 'Critical',
  assignedDeveloper: { employeeId: 'dev-101' },
};

// Mock dependencies
const mockTaskModel = {
  findById: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(mockTask),
  })),
  findOneAndUpdate: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(mockTask),
  })),
  findOne: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(mockTask),
  })),
  find: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue([mockTask]),
  })),
};

const mockKanbanStageModel = {
  find: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(mockKanbanStages),
  })),
};

const mockGptService = {
  getCategoryAndPriority: jest.fn().mockResolvedValue(mockGptResponse),
};

describe('TaskService', () => {
  let service: TaskService;
  let taskModel: Model<Task>;
  let kanbanStageModel: Model<KanbanStage>;
  let gptService: GPTService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken('Task'),
          useValue: mockTaskModel,
        },
        {
          provide: getModelToken('KanbanStages'),
          useValue: mockKanbanStageModel,
        },
        {
          provide: GPTService,
          useValue: mockGptService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskModel = module.get<Model<Task>>(getModelToken('Task'));
    kanbanStageModel = module.get<Model<KanbanStage>>(getModelToken('KanbanStages'));
    gptService = module.get<GPTService>(GPTService);
    
    // Reset mocks for each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should update an existing task if taskId is provided', async () => {
      const updatedBody = { ...mockTask, status: mockKanbanStages[1]._id };
      const expectedUpdatedTask = {
        ...mockTask,
        status: mockKanbanStages[1]._id,
        priority: mockGptResponse.priority,
        assignedTo: mockGptResponse.assignedDeveloper.employeeId
      };
      
      // Mock findById to return the task before the update
      jest.spyOn(taskModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockTask),
      } as any);

      // Mock findOneAndUpdate to return the updated task
      jest.spyOn(taskModel, 'findOneAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(expectedUpdatedTask),
      } as any);

      // Mock kanban stages find to return the mock stages
      jest.spyOn(kanbanStageModel, 'find').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockKanbanStages),
      } as any);

      // Mock GPT service
      jest.spyOn(gptService, 'getCategoryAndPriority').mockResolvedValue(mockGptResponse as any);


      const result = await service.createTask({
        ...updatedBody,
        taskId: mockTask.taskId
      } as any);

      // Expect the findOneAndUpdate call to have the correct updated values
      expect(taskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: updatedBody.taskId },
        expect.objectContaining({
          priority: mockGptResponse.priority,
          assignedTo: mockGptResponse.assignedDeveloper.employeeId,
          status: updatedBody.status
        }),
        { new: true }
      );
      expect(result).toEqual(expectedUpdatedTask);
    });

    it('should create a new task if taskId is not provided', async () => {
      const newTaskBody = {
        description: 'New task',
        projectId: 'proj-123',
      };
      
      // Mock the Mongoose model's constructor and save method
      const mockSave = jest.fn().mockResolvedValue({ _id: 'new-id', ...newTaskBody });
      const mockTaskModelConstructor = jest.fn(() => ({ save: mockSave }));
      
      // Correctly override the model mock for this specific test
      Object.defineProperty(service, 'taskModel', { value: mockTaskModelConstructor });

      const result = await service.createTask(newTaskBody as any);
      
      expect(mockTaskModelConstructor).toHaveBeenCalledWith(newTaskBody);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({ _id: 'new-id', ...newTaskBody });
    });
    
    it('should call GPTService and update task if status is "Testing" stage', async () => {
      const taskInTestingStage = { ...mockTask, status: mockKanbanStages[1]._id };
      
      // Mock findById to return the old task (before status change)
      jest.spyOn(taskModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockTask),
      } as any);
      
      jest.spyOn(kanbanStageModel, 'find').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockKanbanStages),
      } as any);
      
      jest.spyOn(gptService, 'getCategoryAndPriority').mockResolvedValue(mockGptResponse as any);
      
      jest.spyOn(taskModel, 'findOneAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          ...taskInTestingStage,
          priority: mockGptResponse.priority,
          assignedTo: mockGptResponse.assignedDeveloper.employeeId,
        }),
      } as any);
      
      const result = await service.createTask({
        ...taskInTestingStage,
        taskId: taskInTestingStage._id,
        projectId: taskInTestingStage.projectId,
      } as any);

      expect(taskModel.findById).toHaveBeenCalledWith(taskInTestingStage._id);
      expect(kanbanStageModel.find).toHaveBeenCalledWith({ projectId: mockTask.projectId });
      expect(gptService.getCategoryAndPriority).toHaveBeenCalledWith(
        mockTask.projectId,
        mockTask.description,
        "test"
      );
      expect(taskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskInTestingStage._id },
        expect.objectContaining({
          priority: mockGptResponse.priority,
          assignedTo: mockGptResponse.assignedDeveloper.employeeId,
        }),
        { new: true }
      );
      expect(result.priority).toBe(mockGptResponse.priority);
      expect(result.assignedTo).toBe(mockGptResponse.assignedDeveloper.employeeId);
    });
    
    it('should not call GPTService if status is not "Testing" stage', async () => {
      const taskInAnotherStage = { ...mockTask, status: mockKanbanStages[0]._id };
      jest.spyOn(taskModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockTask),
      } as any);
      
      const updateSpy = jest.spyOn(taskModel, 'findOneAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(taskInAnotherStage),
      } as any);
      
      const result = await service.createTask({
        ...taskInAnotherStage,
        taskId: taskInAnotherStage._id,
        projectId: taskInAnotherStage.projectId
      } as any);
      
      expect(gptService.getCategoryAndPriority).not.toHaveBeenCalled();
      expect(result).toEqual(taskInAnotherStage);
    });
  });

  describe('getTaskById', () => {
    it('should return a task if found by taskId', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockTask),
      } as any);
      
      const result = await service.getTaskById('TASK-001');
      expect(taskModel.findOne).toHaveBeenCalledWith({ taskId: 'TASK-001' });
      expect(result).toEqual(mockTask);
    });

    it('should throw HttpException if task not found by taskId', async () => {
      jest.spyOn(taskModel, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      
      await expect(service.getTaskById('TASK-002')).rejects.toThrow(
        new HttpException('Task not found', HttpStatus.NOT_FOUND),
      );
    });
  });
  
  describe('getAllTasks', () => {
    it('should return all tasks for a given projectId', async () => {
      jest.spyOn(taskModel, 'find').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([mockTask, mockTask]),
      } as any);
      
      const result = await service.getAllTasks('project-456');
      expect(taskModel.find).toHaveBeenCalledWith({ projectId: 'project-456' });
      expect(result).toEqual([mockTask, mockTask]);
    });
  });
});
