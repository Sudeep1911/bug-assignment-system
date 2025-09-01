import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProjectService } from './product.service';
import { Model, Types } from 'mongoose';
import { Project } from './product.schema';
import { KanbanStage } from 'src/kanbanStages/kanbanStages.schema';
import { Modules } from 'src/modules/modules.schema';
import { User } from 'src/users/user.schema';
import { TaskService } from 'src/tasks/tasks.service';
import { Task } from 'src/tasks/tasks.schema';
import { CreateProjectDto } from './product.dto';

// Mock data
const mockProjectId = new Types.ObjectId('60c842b157b83c001f3e82a9');
const mockCompanyId = new Types.ObjectId('60c842b157b83c001f3e82a8');
const mockAdminId = new Types.ObjectId('60c842b157b83c001f3e82a7');
const mockEmployeeId1 = new Types.ObjectId('60c842b157b83c001f3e82a6');
const mockEmployeeId2 = new Types.ObjectId('60c842b157b83c001f3e82a5');
const mockModuleId1 = new Types.ObjectId('60c842b157b83c001f3e82a4');
const mockModuleId2 = new Types.ObjectId('60c842b157b83c001f3e82a3');

const mockProject = {
  _id: mockProjectId,
  companyId: mockCompanyId,
  name: 'Test Project',
  description: 'Test Description',
  employees: [mockAdminId, mockEmployeeId1],
  toObject: () => mockProject,
  save: jest.fn().mockResolvedValue(true),
};

const mockKanbanStages = [
  { _id: new Types.ObjectId(), projectId: mockProjectId, name: 'To Do' },
  { _id: new Types.ObjectId(), projectId: mockProjectId, name: 'In Progress' },
];

const mockModules = [
  { _id: mockModuleId1, projectId: mockProjectId, name: 'Module A' },
  { _id: mockModuleId2, projectId: mockProjectId, name: 'Module B' },
];

const mockEmployees = [
  { _id: mockEmployeeId1, email: 'emp1@test.com', details: {} },
  { _id: mockEmployeeId2, email: 'emp2@test.com', details: {} },
];

const mockTasks = [
  {
    _id: 'task-1',
    projectId: mockProjectId.toString(),
    assignedTo: mockEmployeeId1.toString(),
    description: 'Task 1',
  },
  {
    _id: 'task-2',
    projectId: mockProjectId.toString(),
    assignedTo: mockEmployeeId2.toString(),
    description: 'Task 2',
  },
];

const mockCreateProjectDto: CreateProjectDto = {
  adminId: mockAdminId.toString(),
  companyId: mockCompanyId.toString(),
  name: 'New Test Project',
  description: 'A new project for testing',
  startDate: new Date('2023-01-01').toISOString(),
  endDate: new Date('2023-12-31').toISOString(),
  kanbanStages: ['Backlog', 'In Progress', 'Done'],
  modules: ['Module A', 'Module B'],
  employees: [
    { employeeId: mockEmployeeId1.toString(), assignedModules: [{ moduleId: 'Module A', proficiency: 5 }] },
    { employeeId: mockEmployeeId2.toString(), assignedModules: [{ moduleId: 'Module B', proficiency: 4 }] },
  ],
};


// Mock repositories and services
const mockProjectModel = {
  create: jest.fn().mockResolvedValue(mockProject),
  findById: jest.fn().mockResolvedValue(mockProject),
  findByIdAndUpdate: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(mockProject),
  })),
  find: jest.fn().mockResolvedValue([mockProject]),
};

const mockKanbanStageModel = {
  insertMany: jest.fn().mockResolvedValue(mockKanbanStages),
  find: jest.fn().mockResolvedValue(mockKanbanStages),
};

const mockModuleModel = {
  insertMany: jest.fn().mockResolvedValue(mockModules),
  find: jest.fn().mockResolvedValue(mockModules),
};

const mockUserModel = {
  updateOne: jest.fn().mockResolvedValue({}),
};

const mockTaskService = {
  getAllTasks: jest.fn().mockResolvedValue(mockTasks),
};

describe('ProjectService', () => {
  let service: ProjectService;
  let projectModel: Model<Project>;
  let kanbanStageModel: Model<KanbanStage>;
  let moduleModel: Model<Modules>;
  let userModel: Model<User>;
  let taskService: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getModelToken('Project'),
          useValue: mockProjectModel,
        },
        {
          provide: getModelToken('KanbanStages'),
          useValue: mockKanbanStageModel,
        },
        {
          provide: getModelToken('Modules'),
          useValue: mockModuleModel,
        },
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    projectModel = module.get<Model<Project>>(getModelToken('Project'));
    kanbanStageModel = module.get<Model<KanbanStage>>(getModelToken('KanbanStages'));
    moduleModel = module.get<Model<Modules>>(getModelToken('Modules'));
    userModel = module.get<Model<User>>(getModelToken('User'));
    taskService = module.get<TaskService>(TaskService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProject', () => {
    it('should create a new project and associated documents', async () => {
      // Mock the module insertMany to return a more realistic output with an _id
      const mockModulesWithIds = mockCreateProjectDto.modules.map((name, index) => ({
        _id: new Types.ObjectId(),
        name,
        projectId: mockProjectId,
      }));
      jest.spyOn(moduleModel, 'insertMany').mockResolvedValue(mockModulesWithIds as any);

      const result = await service.createProject(mockCreateProjectDto);

      expect(projectModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockCreateProjectDto.name,
          companyId: expect.any(Types.ObjectId),
        }),
      );
      expect(kanbanStageModel.insertMany).toHaveBeenCalledWith(
        mockCreateProjectDto.kanbanStages.map(name => ({
          projectId: mockProjectId,
          name,
        })),
      );
      expect(moduleModel.insertMany).toHaveBeenCalledWith(
        mockCreateProjectDto.modules.map(name => ({
          projectId: mockProjectId,
          name,
        })),
      );
      expect(userModel.updateOne).toHaveBeenCalledTimes(mockCreateProjectDto.employees.length);
      expect(result).toEqual({
        message: 'Project created successfully',
        projectId: mockProjectId,
      });
    });

    it('should throw an error if a module is not found during user assignment', async () => {
      const invalidDto = {
        ...mockCreateProjectDto,
        employees: [
          { employeeId: mockEmployeeId1.toString(), assignedModules: [{ moduleId: 'Nonexistent Module', proficiency: 5 }] },
        ],
      };
      
      // We've mocked insertMany above, so this will return the valid modules, but the DTO references an invalid one
      await expect(service.createProject(invalidDto)).rejects.toThrow('Module Nonexistent Module not found in module list');
    });
  });

  describe('getProjectWithEmployees', () => {
    it('should return a project with employees populated', async () => {
      const mockProjectWithPopulatedEmployees = {
        ...mockProject,
        employees: mockEmployees,
      };
      jest.spyOn(projectModel, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProjectWithPopulatedEmployees),
      } as any);

      const result = await service.getProjectWithEmployees(mockProjectId);
      expect(projectModel.findById).toHaveBeenCalledWith(mockProjectId);
      expect(result).toEqual(mockProjectWithPopulatedEmployees);
    });
  });

  describe('addEmployeesToProject', () => {
    it('should add employees to an existing project', async () => {
      const mockProjectInstance = {
        ...mockProject,
        employees: [...mockProject.employees],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(projectModel, 'findById').mockResolvedValue(mockProjectInstance as any);

      const newEmployees = [mockEmployeeId2];
      await service.addEmployeesToProject(mockProjectId, newEmployees);

      expect(mockProjectInstance.employees).toEqual([...mockProject.employees, ...newEmployees]);
      expect(mockProjectInstance.save).toHaveBeenCalled();
    });

    it('should throw an error if the project is not found', async () => {
      jest.spyOn(projectModel, 'findById').mockResolvedValue(null);
      await expect(service.addEmployeesToProject(mockProjectId, [mockEmployeeId2])).rejects.toThrow('Project not found');
    });
  });

  describe('getProjectsByUserId', () => {
    it('should return projects with populated modules and kanban stages', async () => {
      const mockProjects = [
        { ...mockProject, _id: new Types.ObjectId() },
        { ...mockProject, _id: new Types.ObjectId() },
      ];
      jest.spyOn(projectModel, 'find').mockResolvedValue(mockProjects as any);
      jest.spyOn(moduleModel, 'find').mockResolvedValue(mockModules as any);
      jest.spyOn(kanbanStageModel, 'find').mockResolvedValue(mockKanbanStages as any);

      const result = await service.getProjectsByUserId(mockAdminId);

      expect(projectModel.find).toHaveBeenCalledWith({ employees: mockAdminId });
      expect(result.length).toBe(2);
      expect(result[0].modules).toEqual(mockModules);
      expect(result[0].kanbanStages).toEqual(mockKanbanStages);
    });
  });

  describe('updateProject', () => {
    it('should update and return the project', async () => {
      const updatedBody = { ...mockCreateProjectDto, name: 'Updated Project' };
      const updatedProject = { ...mockProject, name: 'Updated Project' };
      jest.spyOn(projectModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedProject),
      } as any);
      
      const result = await service.updateProject(mockProjectId, updatedBody);

      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: mockProjectId },
        updatedBody,
        { new: true }
      );
      expect(result).toEqual(updatedProject);
    });
  });

  describe('getProjectUsers', () => {
    it('should return employees with their tasks', async () => {
      const mockProjectWithEmployees = {
        ...mockProject,
        employees: mockEmployees,
      };
      
      // Mock the project to return populated employees
      jest.spyOn(projectModel, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProjectWithEmployees),
      } as any);

      const result = await service.getProjectUsers(mockProjectId);

      expect(taskService.getAllTasks).toHaveBeenCalledWith(mockProjectId.toString());
      expect(result.length).toBe(2);
      expect(result[0].tasks).toEqual([mockTasks[0]]);
      expect(result[1].tasks).toEqual([mockTasks[1]]);
    });
    
    it('should throw an error if the project is not found', async () => {
      jest.spyOn(projectModel, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      } as any);
      
      await expect(service.getProjectUsers(mockProjectId)).rejects.toThrow('Project not found');
    });
  });

  describe('getProjectModules', () => {
    it('should return modules for a given project', async () => {
      jest.spyOn(moduleModel, 'find').mockResolvedValue(mockModules as any);
      const result = await service.getProjectModules(mockProjectId);
      expect(moduleModel.find).toHaveBeenCalledWith({ projectId: mockProjectId });
      expect(result).toEqual(mockModules);
    });
  });
});
