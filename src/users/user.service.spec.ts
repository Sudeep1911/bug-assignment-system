import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersRepo } from './user.repo';
import { CompanyRepo } from 'src/company/company.repo';
import axios from 'axios';
import { generateRandomPassword } from '../../src/utils/password.utils';

// Mock the external libraries and modules
jest.mock('axios');
jest.mock('../../src/utils/password.utils');

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  password: 'hashed-password',
  role: 'developer',
  name: 'Test User',
  companyId: 'company-456'
};

const mockCompany = {
  id: 'company-456',
  name: 'Test Company'
};

const mockUsersRepo = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  createUser: jest.fn(),
  createUserWithCompanyId: jest.fn(),
  findByEmailAndCompany: jest.fn(),
};

const mockCompanyRepo = {
  findCompanyById: jest.fn(),
};

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGenerateRandomPassword = generateRandomPassword as jest.Mock;

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: UsersRepo;
  let companyRepo: CompanyRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepo,
          useValue: mockUsersRepo,
        },
        {
          provide: CompanyRepo,
          useValue: mockCompanyRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<UsersRepo>(UsersRepo);
    companyRepo = module.get<CompanyRepo>(CompanyRepo);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      mockUsersRepo.findByEmail.mockResolvedValue(null);
      mockUsersRepo.createUser.mockResolvedValue(mockUser);

      const result = await service.createUser(
        mockUser.email,
        'password123',
        'developer',
        'Test User',
      );

      expect(userRepo.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(userRepo.createUser).toHaveBeenCalledWith(
        mockUser.email,
        'password123',
        'developer',
        'Test User',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw HttpException if user already exists', async () => {
      mockUsersRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.createUser(mockUser.email, 'password123', 'developer'),
      ).rejects.toThrow(new HttpException('User already exists', HttpStatus.BAD_REQUEST));
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockUsersRepo.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);
      expect(userRepo.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockUser);
    });

    it('should throw HttpException if user not found by email', async () => {
      mockUsersRepo.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('findById', () => {
    it('should find a user by ID', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);
      expect(userRepo.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw HttpException if user not found by ID', async () => {
      mockUsersRepo.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      mockUsersRepo.findByEmail.mockResolvedValue(mockUser);

      const result = await service.signIn(mockUser.email, mockUser.password);
      expect(userRepo.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockUser);
    });

    it('should throw HttpException for invalid credentials', async () => {
      mockUsersRepo.findByEmail.mockResolvedValue({ ...mockUser, password: 'wrong-password' });

      await expect(service.signIn(mockUser.email, 'password123')).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw HttpException if user not found during sign in', async () => {
      mockUsersRepo.findByEmail.mockResolvedValue(null);
  
      await expect(service.signIn('nonexistent@example.com', 'any-password')).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('createEmployees', () => {
    const employeesData: {
      role: 'developer' | 'tester';
      email: string;
      name: string;
    }[] = [
      { role: 'developer', email: 'dev1@test.com', name: 'Dev One' },
      { role: 'tester', email: 'tester2@test.com', name: 'Tester Two' },
    ];
    const companyId = 'company-456';

    it('should create new employees and send emails', async () => {
      mockCompanyRepo.findCompanyById.mockResolvedValue(mockCompany);
      mockUsersRepo.findByEmailAndCompany.mockResolvedValue(null);
      mockUsersRepo.findByEmail.mockResolvedValue(null);
      mockedGenerateRandomPassword.mockReturnValue('random-pass');
      mockUsersRepo.createUserWithCompanyId.mockResolvedValue(mockUser);
      jest.spyOn(service, 'sendEmail').mockResolvedValue(true);

      const result = await service.createEmployees(employeesData, companyId);
      expect(companyRepo.findCompanyById).toHaveBeenCalledWith(companyId);
      expect(userRepo.findByEmailAndCompany).toHaveBeenCalledTimes(employeesData.length);
      expect(userRepo.findByEmail).toHaveBeenCalledTimes(employeesData.length);
      expect(userRepo.createUserWithCompanyId).toHaveBeenCalledTimes(employeesData.length);
      expect(service.sendEmail).toHaveBeenCalledTimes(employeesData.length);
      expect(result).toEqual({ created: true });
    });

    it('should handle existing employees and send emails without creating a new user', async () => {
      mockCompanyRepo.findCompanyById.mockResolvedValue(mockCompany);
      mockUsersRepo.findByEmailAndCompany.mockResolvedValue(null);
      mockUsersRepo.findByEmail.mockResolvedValue(mockUser); // User exists but not in this company
      jest.spyOn(service, 'sendEmail').mockResolvedValue(true);

      const result = await service.createEmployees(employeesData, companyId);
      expect(userRepo.createUserWithCompanyId).not.toHaveBeenCalled();
      expect(service.sendEmail).toHaveBeenCalledTimes(employeesData.length);
      expect(result).toEqual({ created: true });
    });
    
    it('should skip creating user if employee already exists in company', async () => {
      mockCompanyRepo.findCompanyById.mockResolvedValue(mockCompany);
      mockUsersRepo.findByEmailAndCompany.mockResolvedValue(mockUser);
      mockUsersRepo.findByEmail.mockResolvedValue(mockUser);
      mockUsersRepo.createUserWithCompanyId.mockResolvedValue(mockUser);
      jest.spyOn(service, 'sendEmail').mockResolvedValue(true);

      const result = await service.createEmployees(employeesData, companyId);
      
      // Since all employees in employeesData are considered "existing employees",
      // the `createUserWithCompanyId` and `sendEmail` methods should not be called at all.
      // The map function will just return `true` for each element.
      expect(userRepo.createUserWithCompanyId).not.toHaveBeenCalled();
      expect(service.sendEmail).not.toHaveBeenCalled();
      
      expect(result).toEqual({ created: true });
    });
  });

  describe('sendEmail', () => {
    it('should send an email with a new password', async () => {
      mockedAxios.post.mockResolvedValue({ data: { status: 'sent' } });
      
      const email = 'newuser@example.com';
      const companyName = 'Test Company';
      const password = 'new-password';
      
      await service.sendEmail(email, companyName, password);
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://hooks.konnectify.co/webhook/v1/KvOIOTol3d',
        expect.objectContaining({
          TO: email,
          sub: `Welcome to Bug Tracker Pro, ${email}`,
          body: expect.stringContaining(`Password: ${password}`),
        }),
      );
    });

    it('should send an email without a password for existing users', async () => {
      mockedAxios.post.mockResolvedValue({ data: { status: 'sent' } });
      
      const email = 'existinguser@example.com';
      const companyName = 'Existing Company';
      
      await service.sendEmail(email, companyName);
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://hooks.konnectify.co/webhook/v1/KvOIOTol3d',
        expect.objectContaining({
          TO: email,
          sub: `Welcome to Bug Tracker Pro, ${email}`,
          body: expect.stringContaining('You can now log in using your existing credentials'),
        }),
      );
      expect(mockedAxios.post).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining('Password'),
        }),
      );
    });

    it('should throw HttpException if email sending fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));
      
      await expect(service.sendEmail('fail@example.com', 'Test Company')).rejects.toThrow(
        new HttpException('Email sending failed', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
});
