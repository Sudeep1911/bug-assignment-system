import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.schema';
import { UsersRepo } from 'src/users/user.repo';
import { UsersService } from 'src/users/user.service';
import { EmployeeRepo } from './employee.repo';
import { CompanyRepo } from 'src/company/company.repo';
import axios from 'axios';

// Mock data
const mockEmployeeId = 'emp-123';
const mockCompanyId = 'comp-456';
const mockEmployee = {
  _id: mockEmployeeId,
  companyId: mockCompanyId,
  firstName: 'John',
  lastName: 'Doe',
};

// Mock dependencies
const mockEmployeeModel = {
  findById: jest.fn(),
};

const mockUsersRepo = {};
const mockUsersService = {};
const mockEmployeeRepo = {};
const mockCompanyRepo = {};
const mockAxios = {
  post: jest.fn(),
};

describe('EmployeeService', () => {
  let service: EmployeeService;
  let employeeModel: Model<Employee>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getModelToken('Employee'),
          useValue: mockEmployeeModel,
        },
        {
          provide: UsersRepo,
          useValue: mockUsersRepo,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: EmployeeRepo,
          useValue: mockEmployeeRepo,
        },
        {
          provide: CompanyRepo,
          useValue: mockCompanyRepo,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    employeeModel = module.get<Model<Employee>>(getModelToken('Employee'));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEmployeeById', () => {
    it('should return an employee if found', async () => {
      jest.spyOn(employeeModel, 'findById').mockResolvedValue(mockEmployee as any);
      
      const result = await service.getEmployeeById(mockEmployeeId, mockCompanyId);

      expect(employeeModel.findById).toHaveBeenCalledWith(mockEmployeeId, mockCompanyId);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw HttpException if employee not found', async () => {
      jest.spyOn(employeeModel, 'findById').mockResolvedValue(null);

      await expect(service.getEmployeeById('non-existent-id', mockCompanyId)).rejects.toThrow(
        new HttpException('Employee not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
