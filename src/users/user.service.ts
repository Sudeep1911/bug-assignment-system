import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { UsersRepo } from './user.repo';
import { generateRandomPassword } from 'src/utils/password.utils';
import { CompanyRepo } from 'src/company/company.repo';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(
    private userRepo: UsersRepo,
    private companyRepo: CompanyRepo,
  ) {}

  // Create a new user
  async createUser(
    email: string,
    password: string,
    role: 'admin' | 'developer' | 'tester',
    name?: string,
  ): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const newUser = await this.userRepo.createUser(email, password, role, name);
    return newUser;
  }

  // Find a user by email
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (user.password !== password) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async createEmployees(
    employeesData: {
      role: 'developer' | 'tester';
      email: string;
    }[],
    companyId: string,
  ) {
    const company = await this.companyRepo.findCompanyById(companyId);
    await Promise.all(
      employeesData.map(async (data) => {
        const { role, email } = data;

        const existingEmployee = await this.userRepo.findByEmailAndCompany(
          email,
          companyId,
        );

        if (existingEmployee) {
          return true;
        }
        // Check if the user already exists
        let user = await this.userRepo.findByEmail(email);

        // If the user doesn't exist, create a new user
        if (!user) {
          const password = generateRandomPassword(8);
          user = await this.userRepo.createUserWithCompanyId(
            email,
            password,
            role,
            companyId,
          );
          await this.sendEmail(email, company.name, password);
        } else {
          await this.sendEmail(email, company.name);
        }
        return true;
      }),
    );

    return { created: true };
  }

  async sendEmail(email: string, companyName: string, password?: string) {
    try {
      const baseMessage = `You have been added to the company: ${companyName}.`;
      const loginUrl = `${process.env.BASE_URL}/login`;

      const body = password
        ? `Your account has been created.<br>
           Email: ${email}<br>
           Password: ${password}<br>
           You can now log in by clicking the button below:<br>
           <a href="${loginUrl}" class="btn">Login</a>`
        : `You can now log in using your existing credentials.<br>
           <a href="${loginUrl}" class="btn">Login</a>`;

      const payload = {
        TO: email,
        sub: `Welcome to Bug Tracker Pro, ${email}`,
        body,
      };

      const response = await axios.post(
        'https://hooks.konnectify.co/webhook/v1/KvOIOTol3d',
        payload,
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Email sending failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
