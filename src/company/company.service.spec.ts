import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyService } from './company.service';
import { Company } from './company.schema';
import { UsersService } from 'src/users/user.service';
import { UsersRepo } from 'src/users/user.repo';
import { CompanyRepo } from './company.repo';
import { User } from 'src/users/user.schema';

// Mock Data
const mockCompanyId = new Types.ObjectId('60c842b157b83c001f3e82a9');
const mockUserId = new Types.ObjectId('60c842b157b83c001f3e82a7');

const mockUser = {
  _id: mockUserId,
  email: 'testuser@example.com',
  companyId: null,
};

const mockCompany = {
  _id: mockCompanyId,
  name: 'Test Company',
  ownerId: mockUserId,
  industry: 'IT',
  description: 'A test company',
};

const mockUpdatedCompany = {
  ...mockCompany,
  name: 'Updated Company Name',
};

// Mock Repositories
const mockUsersRepo = {
  findById: jest.fn(),
  updateUser: jest.fn(),
  findUsersByCompanyId: jest.fn(),
};

const mockCompanyRepo = {
  findCompanyByName: jest.fn(),
  createCompany: jest.fn(),
  findCompanyById: jest.fn(),
};

// Mock Models
const mockCompanyModel = {
  findOneAndUpdate: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(mockUpdatedCompany),
  })),
};

describe('CompanyService', () => {
  let service: CompanyService;
  let companyRepo: CompanyRepo;
  let userRepo: UsersRepo;
  let companyModel: Model<Company>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: getModelToken('Company'),
          useValue: mockCompanyModel,
        },
        {
          provide: CompanyRepo,
          useValue: mockCompanyRepo,
        },
        {
          provide: UsersRepo,
          useValue: mockUsersRepo,
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    companyRepo = module.get<CompanyRepo>(CompanyRepo);
    userRepo = module.get<UsersRepo>(UsersRepo);
    companyModel = module.get<Model<Company>>(getModelToken('Company'));
    
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCompany', () => {
    it('should create a company and update the user', async () => {
      jest.spyOn(userRepo, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(companyRepo, 'findCompanyByName').mockResolvedValue(null);
      jest.spyOn(companyRepo, 'createCompany').mockResolvedValue(mockCompany as any);
      // Correcting the mock to return a user object
      const updatedMockUser = { ...mockUser, companyId: mockCompanyId.toString() };
      jest.spyOn(userRepo, 'updateUser').mockResolvedValue(updatedMockUser as any);

      const result = await service.createCompany(
        mockCompany.name,
        mockUserId.toString(),
        mockCompany.industry,
        mockCompany.description,
      );

      expect(userRepo.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(companyRepo.findCompanyByName).toHaveBeenCalledWith(
        mockCompany.name,
        mockUserId.toString(),
      );
      expect(companyRepo.createCompany).toHaveBeenCalledWith(
        mockCompany.name,
        mockUserId.toString(),
        mockCompany.industry,
        mockCompany.description,
      );
      expect(userRepo.updateUser).toHaveBeenCalledWith(
        mockUserId.toString(),
        mockCompany._id.toString(),
      );
      expect(result).toEqual(mockCompany);
    });

    it('should throw HttpException if user not found', async () => {
      jest.spyOn(userRepo, 'findById').mockResolvedValue(null);

      await expect(service.createCompany(
        'Some Company',
        'non-existent-user-id',
        'IT',
        'Description',
      )).rejects.toThrow(new HttpException('User not found', HttpStatus.NOT_FOUND));
    });

    it('should throw HttpException if company already exists', async () => {
      jest.spyOn(userRepo, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(companyRepo, 'findCompanyByName').mockResolvedValue(mockCompany as any);

      await expect(service.createCompany(
        mockCompany.name,
        mockUserId.toString(),
        mockCompany.industry,
        mockCompany.description,
      )).rejects.toThrow(new HttpException('Company already exists', HttpStatus.BAD_REQUEST));
    });
  });

  describe('getUsersByCompanyId', () => {
    it('should return a list of users for a company', async () => {
      const mockUsers = [{ ...mockUser, companyId: mockCompanyId }];
      jest.spyOn(userRepo, 'findUsersByCompanyId').mockResolvedValue(mockUsers as any);

      const result = await service.getUsersByCompanyId(mockCompanyId.toString());

      expect(userRepo.findUsersByCompanyId).toHaveBeenCalledWith(mockCompanyId.toString());
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getCompanyById', () => {
    it('should return a company if found', async () => {
      jest.spyOn(companyRepo, 'findCompanyById').mockResolvedValue(mockCompany as any);

      const result = await service.getCompanyById(mockCompanyId.toString());

      expect(companyRepo.findCompanyById).toHaveBeenCalledWith(mockCompanyId.toString());
      expect(result).toEqual(mockCompany);
    });

    it('should throw HttpException if company not found', async () => {
      jest.spyOn(companyRepo, 'findCompanyById').mockResolvedValue(null);

      await expect(service.getCompanyById('non-existent-id')).rejects.toThrow(
        new HttpException('Company not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateCompany', () => {
    it('should update and return the company', async () => {
      const body = { name: 'Updated Company Name' };
      
      const result = await service.updateCompany(mockCompanyId.toString(), body);

      expect(companyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockCompanyId.toString() },
        body,
        { new: true },
      );
      expect(result).toEqual(mockUpdatedCompany);
    });

    it('should throw HttpException if company not found during update', async () => {
      jest.spyOn(companyModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.updateCompany('non-existent-id', {})).rejects.toThrow(
        new HttpException('Company not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
